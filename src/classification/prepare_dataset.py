
from __future__ import annotations

import json
import re
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
RAW_PATH = DATA_DIR / "resumes_dataset.jsonl"
OUTPUT_PATH = DATA_DIR / "labelled_resumes_clean.csv"

# The exact boilerplate template header identified during data inspection.
_BOILERPLATE_PATTERN = re.compile(
    r"jessica claire.*?professional summary", flags=re.IGNORECASE | re.DOTALL
)


def strip_known_boilerplate(text: str) -> str:
    return _BOILERPLATE_PATTERN.sub("", text)


def load_raw_resumes(path: Path = RAW_PATH) -> pd.DataFrame:
    rows = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            rows.append(json.loads(line))
    return pd.DataFrame(rows)


def prepare_dataset(raw_path: Path = RAW_PATH, output_path: Path = OUTPUT_PATH) -> pd.DataFrame:
    df = load_raw_resumes(raw_path)

    # Remove known boilerplate header
    df["resume_text"] = df["Text"].fillna("").apply(strip_known_boilerplate)

    # Remove very short resumes
    df = df[df["resume_text"].str.len() > 50].copy()

    # Create clean dataset
    clean_df = df[["resume_text", "Category", "Source"]].rename(
        columns={"Category": "category", "Source": "source"}
    )

    # Remove duplicate resumes
    clean_df = clean_df.drop_duplicates(subset=["resume_text"])

    # Remove missing values
    clean_df = clean_df.dropna(subset=["resume_text", "category"])

    # Normalize whitespace
    clean_df["resume_text"] = (
        clean_df["resume_text"]
        .astype(str)
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )

    # Normalize category labels
    clean_df["category"] = (
        clean_df["category"]
        .astype(str)
        .str.strip()
    )

    print(f"Prepared {len(clean_df)} cleaned resumes")

    clean_df.to_csv(output_path, index=False)

    return clean_df

if __name__ == "__main__":
    result = prepare_dataset()
    print(f"Prepared {len(result)} cleaned resumes -> {OUTPUT_PATH}")
    print()
    print("Category distribution:")
    print(result["category"].value_counts())
