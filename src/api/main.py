"""FastAPI backend for ResumeIQ — auth + skill-match analysis."""

from __future__ import annotations

import hashlib
import json
import secrets
import sys
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.services.analyze import analyze_resume, list_job_titles

DATA_DIR = ROOT / "data"
USERS_PATH = DATA_DIR / "users.json"
ANALYSES_PATH = DATA_DIR / "analyses.json"
TOKENS: dict[str, str] = {}  # token -> email

app = FastAPI(title="ResumeIQ API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=3, max_length=120)
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=120)
    password: str


class AuthResponse(BaseModel):
    token: str
    email: str
    name: str


def _hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()
    return salt, digest


def _load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)


def _get_users() -> dict[str, dict]:
    return _load_json(USERS_PATH, {})


def _current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.removeprefix("Bearer ").strip()
    email = TOKENS.get(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    users = _get_users()
    user = users.get(email.lower())
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {"email": email.lower(), "name": user["name"], "token": token}


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/register", response_model=AuthResponse)
def register(body: RegisterRequest) -> AuthResponse:
    users = _get_users()
    email = body.email.lower()
    if email in users:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    salt, password_hash = _hash_password(body.password)
    users[email] = {
        "name": body.name.strip(),
        "email": email,
        "salt": salt,
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _save_json(USERS_PATH, users)
    token = secrets.token_urlsafe(32)
    TOKENS[token] = email
    return AuthResponse(token=token, email=email, name=users[email]["name"])


@app.post("/api/auth/login", response_model=AuthResponse)
def login(body: LoginRequest) -> AuthResponse:
    users = _get_users()
    email = body.email.lower()
    user = users.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    _, password_hash = _hash_password(body.password, user["salt"])
    if not secrets.compare_digest(password_hash, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = secrets.token_urlsafe(32)
    TOKENS[token] = email
    return AuthResponse(token=token, email=email, name=user["name"])


@app.get("/api/auth/me")
def me(user: dict = Depends(_current_user)) -> dict:
    return {"email": user["email"], "name": user["name"]}


@app.post("/api/auth/logout")
def logout(user: dict = Depends(_current_user)) -> dict[str, bool]:
    TOKENS.pop(user["token"], None)
    return {"ok": True}


@app.get("/api/jobs")
def jobs(user: dict = Depends(_current_user)) -> dict[str, list[str]]:
    return {"titles": list_job_titles()}


@app.post("/api/analyze")
async def analyze(
    job_title: str = Form(...),
    file: UploadFile = File(...),
    user: dict = Depends(_current_user),
) -> dict[str, Any]:
    suffix = Path(file.filename or "resume.pdf").suffix.lower()
    if suffix not in {".pdf", ".docx"}:
        raise HTTPException(status_code=400, detail="Only PDF or DOCX resumes are supported")

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = analyze_resume(tmp_path, job_title)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc

    record = {
        "id": str(uuid.uuid4()),
        "email": user["email"],
        "filename": file.filename,
        "created_at": datetime.now(timezone.utc).isoformat(),
        **result,
    }
    history = _load_json(ANALYSES_PATH, [])
    history.insert(0, record)
    _save_json(ANALYSES_PATH, history[:200])
    return record


@app.get("/api/analyses")
def analyses(user: dict = Depends(_current_user)) -> dict[str, list]:
    history = _load_json(ANALYSES_PATH, [])
    mine = [h for h in history if h.get("email") == user["email"]]
    return {"items": mine[:50]}


@app.get("/api/analyses/{analysis_id}")
def analysis_detail(analysis_id: str, user: dict = Depends(_current_user)) -> dict:
    history = _load_json(ANALYSES_PATH, [])
    for item in history:
        if item.get("id") == analysis_id and item.get("email") == user["email"]:
            return item
    raise HTTPException(status_code=404, detail="Analysis not found")
