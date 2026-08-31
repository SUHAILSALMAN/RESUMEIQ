# ResumeIQ — AI-Powered Resume Skill Match & Career Readiness Analysis

This is my BSc (Hons) Data Science dissertation project (CIS6001). ResumeIQ takes a candidate's CV and compares it against a database of job roles, extracting skills, scoring the match, and giving a readiness breakdown for a chosen career path.

## Overview

The system is built around a few core stages:

- **Text extraction** — pulls text from PDF resumes, with an OCR fallback (via `pytesseract`) for scanned/image-based CVs that don't have a real text layer.
- **Preprocessing** — cleans and normalises resume text (stopword removal, tokenisation) without relying on any internet-fetched resources, so it's fully self-contained.
- **Skill extraction & job-role matching** — extracts skills from free text and compares them against a taxonomy built from a dataset of 324 job roles covering 764 unique skills.
- **Matching models** — a TF-IDF baseline is implemented and benchmarked; Doc2Vec and sentence-transformer embedding matchers are written and ready to run once the relevant packages are installed.
- **Classification** — a resume category classifier trained on ~3,500 labelled resumes across 36 categories, with SMOTE-based class balancing and SHAP-based explainability planned as the next layer.

## Results so far

- TF-IDF baseline retrieval: **MRR 0.76, Precision@5 0.84**, evaluated on 128 sampled resumes against all 324 job roles.
- Classification baseline (pre-SMOTE): **88.7% accuracy, 0.92 macro-F1** across 36 resume categories — confirms the full pipeline works end to end before adding balancing and interpretability.

Full methodology and how these results map to the project brief are in `PROJECT_PLAN.md`.

## A couple of data quirks worth knowing about

- Around 58% of the ResumeAtlas-sourced resumes shared an identical boilerplate contact header — this gets stripped during preprocessing (`prepare_dataset.py`).
- The `Skills` column in the raw ResumeAtlas data is unreliable (every one of the 2,337 rows has the exact same value), so skills are extracted from the resume text itself via NLP rather than trusted from that column.
- Four of the 36 resume categories (Engineering Manager, Principal Engineer, SQL Developer, Site Reliability Engineer) don't have a clean matching title in the job roles dataset, so they're excluded from the retrieval benchmark rather than force-matched.

## Setup (Windows PowerShell)

```powershell
cd D:\Suhail\resume_readiness_system
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm   # optional, improves skill matching
```

> Use `.\venv\Scripts\activate`, not `source venv/bin/activate` — this is a Windows setup.

You'll also need the Tesseract OCR and Poppler system binaries installed separately (see comments in `requirements.txt`) — OCR won't work from the Python packages alone.

## Running the app

The main product interface is a React frontend backed by a FastAPI service.

| Service | URL |
|---|---|
| ResumeIQ UI | http://127.0.0.1:5173 |
| API | http://127.0.0.1:8000 |

**Terminal 1 — API**
```powershell
cd D:\Suhail\resume_readiness_system
.\venv\Scripts\activate
python -m uvicorn src.api.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — Frontend**
```powershell
cd D:\Suhail\resume_readiness_system\frontend
pnpm install
pnpm dev
```

Then open http://127.0.0.1:5173 and go through **Register/Login → Dashboard → Skill Match** (upload a CV, pick a job role).

If PowerShell blocks `activate` due to execution policy, run once:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```
or skip activation entirely and call tools directly via `.\venv\Scripts\python.exe`.

`ui-reference/` holds design references only — not part of the running app.

There's also a legacy Streamlit demo at `http://localhost:8501`, kept for comparison but not the main interface:
```powershell
.\venv\Scripts\activate
python -m streamlit run src\app\streamlit_app.py
```

## Project structure

RESUMEIQ/
├── data/
│   ├── job_roles.csv
│   ├── resumes_dataset.jsonl
│   ├── labelled_resumes_clean.csv
│   └── skills_dictionary.json
│
├── models/
│   └── category_classifier.joblib
│
├── src/
│   ├── api/
│   ├── extraction/
│   ├── preprocessing/
│   ├── skills/
│   ├── matching/
│   └── classification/
│
├── frontend/
├── tests/
├── requirements.txt
├── README.md
└── .gitignore

## What's left

`gensim`, `sentence-transformers`, `imbalanced-learn`, and `shap` are implemented but not yet run end-to-end locally — next step is installing them and validating the embedding-based matchers, SMOTE balancing, and SHAP explainability against the baseline results above.
