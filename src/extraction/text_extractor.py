"""
Resume text extraction module.

Addresses reviewer feedback point 2:
"Integrate a lightweight OCR library (such as pytesseract) to protect the
text extraction layer from scanned document failures."

Strategy:
1. Try native text extraction first (pdfplumber for PDF, python-docx for DOCX).
2. If the native extraction returns suspiciously little text, fall back to OCR.
3. On Windows, auto-detect Tesseract / Poppler install paths when not on PATH.
"""

from __future__ import annotations

import os
import shutil
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

import pdfplumber
import docx
import pytesseract
from pdf2image import convert_from_path
from pdf2image.exceptions import PDFInfoNotInstalledError

MIN_CHARS_PER_PAGE_THRESHOLD = 40

_OCR_INSTALL_HINT = (
    "OCR requires Tesseract and Poppler. "
    "Tesseract was not found on PATH. Install with: "
    "winget install UB-Mannheim.TesseractOCR "
    "and winget install oschwartz10612.Poppler, then restart the app."
)

_TESSERACT_CONFIGURED = False


def _repair_ntpath() -> None:
    """Restore ntpath.split if Streamlit's watcher left ntpath in a broken state.

    Seen on Windows when the project lives on a non-C: drive with Streamlit's
    file watcher enabled — os.path / pathlib then raise:
    AttributeError: module 'ntpath' has no attribute 'split'
    """
    import importlib
    import ntpath

    needed = ("split", "join", "sep", "splitext", "basename", "dirname")
    if all(hasattr(ntpath, name) for name in needed):
        return

    importlib.reload(ntpath)
    if all(hasattr(ntpath, name) for name in needed):
        return

    def _split(p):  # pragma: no cover - only for broken runtimes
        p = os.fspath(p)
        if hasattr(ntpath, "splitdrive"):
            drive, p = ntpath.splitdrive(p)
        else:
            drive = ""
        seps = "\\/"
        i = len(p)
        while i and p[i - 1] not in seps:
            i -= 1
        head, tail = p[:i], p[i:]
        head2 = head.rstrip(seps)
        return drive + (head2 or head), tail

    ntpath.split = _split  # type: ignore[method-assign]


@dataclass
class ExtractionResult:
    text: str
    method: str  # "native_pdf", "ocr_pdf", "native_docx", "ocr_docx_images"
    ocr_used: bool
    pages_processed: int = 0
    warnings: list = field(default_factory=list)


def _configure_tesseract() -> None:
    """Point pytesseract at tesseract.exe even when it is not on PATH."""
    global _TESSERACT_CONFIGURED
    if _TESSERACT_CONFIGURED:
        return

    if shutil.which("tesseract"):
        _TESSERACT_CONFIGURED = True
        return

    candidates = [
        Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe"),
        Path(r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"),
        Path.home() / r"AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
    ]
    for candidate in candidates:
        if candidate.is_file():
            pytesseract.pytesseract.tesseract_cmd = str(candidate)
            tess_dir = str(candidate.parent)
            if tess_dir not in os.environ.get("PATH", ""):
                os.environ["PATH"] = tess_dir + os.pathsep + os.environ.get("PATH", "")
            _TESSERACT_CONFIGURED = True
            return

    _TESSERACT_CONFIGURED = True


def _find_poppler_path() -> str | None:
    """Return Poppler's bin directory if pdfinfo is discoverable."""
    pdfinfo = shutil.which("pdfinfo")
    if pdfinfo:
        return str(Path(pdfinfo).resolve().parent)

    winget_root = Path.home() / "AppData/Local/Microsoft/WinGet/Packages"
    if winget_root.is_dir():
        matches = sorted(winget_root.glob("oschwartz10612.Poppler*/**/pdfinfo.exe"))
        if matches:
            return str(matches[-1].resolve().parent)

    for candidate in (
        Path(r"C:\Program Files\poppler\Library\bin"),
        Path(r"C:\poppler\Library\bin"),
    ):
        if (candidate / "pdfinfo.exe").is_file():
            return str(candidate)
    return None


def _file_extension(path: str) -> str:
    """Return lowercased extension (e.g. '.pdf') without using os.path.

    Streamlit on some Windows/Python 3.13 setups can leave ntpath in a broken
    state where os.path.splitext raises AttributeError on ntpath.split.
    """
    base = str(path).replace("\\", "/").rsplit("/", 1)[-1]
    dot = base.rfind(".")
    return base[dot:].lower() if dot != -1 else ""


def _extract_pdf_native(path: str) -> tuple[str, int]:
    text_chunks = []
    with pdfplumber.open(path) as pdf:
        n_pages = len(pdf.pages)
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            text_chunks.append(page_text)
    return "\n".join(text_chunks), n_pages


def _extract_pdf_ocr(path: str, dpi: int = 300) -> tuple[str, int]:
    _configure_tesseract()
    poppler_path = _find_poppler_path()
    try:
        images = convert_from_path(path, dpi=dpi, poppler_path=poppler_path)
    except PDFInfoNotInstalledError as exc:
        raise RuntimeError(_OCR_INSTALL_HINT) from exc

    text_chunks = []
    for image in images:
        try:
            page_text = pytesseract.image_to_string(image)
        except pytesseract.TesseractNotFoundError as exc:
            raise RuntimeError(_OCR_INSTALL_HINT) from exc
        text_chunks.append(page_text)
    return "\n".join(text_chunks), len(images)


def extract_from_pdf(path: str) -> ExtractionResult:
    warnings = []
    native_text, n_pages = _extract_pdf_native(path)
    avg_chars_per_page = len(native_text.strip()) / max(n_pages, 1)

    if avg_chars_per_page >= MIN_CHARS_PER_PAGE_THRESHOLD:
        return ExtractionResult(
            text=native_text,
            method="native_pdf",
            ocr_used=False,
            pages_processed=n_pages,
        )

    warnings.append(
        f"Native text layer produced only {avg_chars_per_page:.1f} chars/page; "
        "falling back to OCR (pytesseract)."
    )
    try:
        ocr_text, n_ocr_pages = _extract_pdf_ocr(path)
    except RuntimeError as exc:
        warnings.append(str(exc))
        return ExtractionResult(
            text=native_text,
            method="native_pdf",
            ocr_used=False,
            pages_processed=n_pages,
            warnings=warnings,
        )
    return ExtractionResult(
        text=ocr_text,
        method="ocr_pdf",
        ocr_used=True,
        pages_processed=n_ocr_pages,
        warnings=warnings,
    )


def extract_from_docx(path: str) -> ExtractionResult:
    document = docx.Document(path)
    paragraphs = [p.text for p in document.paragraphs]
    text = "\n".join(paragraphs)

    if len(text.strip()) >= MIN_CHARS_PER_PAGE_THRESHOLD:
        return ExtractionResult(text=text, method="native_docx", ocr_used=False, pages_processed=1)

    warnings = ["DOCX text layer nearly empty; attempting OCR on embedded images."]
    _configure_tesseract()
    ocr_chunks = []
    image_parts = [
        rel.target_part for rel in document.part.rels.values() if "image" in rel.reltype
    ]
    try:
        with tempfile.TemporaryDirectory(prefix="_docx_image_ocr_") as tmp_dir:
            for i, part in enumerate(image_parts):
                img_path = str(Path(tmp_dir) / f"img_{i}.png")
                with open(img_path, "wb") as f:
                    f.write(part.blob)
                ocr_chunks.append(pytesseract.image_to_string(img_path))
    except pytesseract.TesseractNotFoundError:
        warnings.append(_OCR_INSTALL_HINT)
        return ExtractionResult(
            text=text,
            method="native_docx",
            ocr_used=False,
            pages_processed=1,
            warnings=warnings,
        )

    return ExtractionResult(
        text="\n".join(ocr_chunks) if ocr_chunks else text,
        method="ocr_docx_images" if ocr_chunks else "native_docx",
        ocr_used=bool(ocr_chunks),
        pages_processed=1,
        warnings=warnings,
    )


def extract_text(path: str) -> ExtractionResult:
    """Dispatch extraction based on file extension."""
    _repair_ntpath()
    name = str(path)
    ext = _file_extension(name)
    if ext == ".pdf":
        return extract_from_pdf(name)
    if ext == ".docx":
        return extract_from_docx(name)
    raise ValueError(f"Unsupported file format: {ext}. Please upload a PDF or DOCX resume.")


if __name__ == "__main__":
    import sys

    result = extract_text(sys.argv[1])
    print(f"Method: {result.method} | OCR used: {result.ocr_used} | Pages: {result.pages_processed}")
    if result.warnings:
        print("Warnings:", result.warnings)
    print("---- Extracted text (first 500 chars) ----")
    print(result.text[:500])
