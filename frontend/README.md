# ResumeIQ Frontend

Production UI for the Resume Readiness System.

**Design source:** `../ui-reference/` (Figma Make reference — do not treat as the app).
This folder is a working copy of that design, extended with auth, dashboard, and
skill-match pages that call the FastAPI backend.

## Run

```bash
# From repo root — API
uvicorn src.api.main:app --reload --port 8000

# From this folder — UI
pnpm install
pnpm dev
```

Open http://127.0.0.1:5173
