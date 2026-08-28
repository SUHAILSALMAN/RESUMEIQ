"""Shared resume analysis pipeline used by Streamlit and the FastAPI backend."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from src.extraction.text_extractor import extract_text
from src.preprocessing.text_cleaner import preprocess
from src.skills.skill_extractor import (
    compare_skills,
    extract_skills,
    get_required_skills,
    load_job_roles,
    load_skills_dictionary,
    suggest_related_roles,
)
from src.matching.tfidf_matcher import tfidf_similarity

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"
MODELS_DIR = ROOT / "models"

# Map classifier category labels → concrete job titles in job_roles.csv
_CATEGORY_TO_JOBS: dict[str, list[str]] = {
    "Web Designing": ["Web Designer", "UI/UX Designer", "Frontend Developer"],
    "UI/UX Designer": ["UI/UX Designer", "Web Designer", "Frontend Developer"],
    "Frontend Developer": ["Frontend Developer", "Full Stack Developer", "UI/UX Designer"],
    "Backend Developer": ["Backend Developer", "Full Stack Developer", "Software Developer"],
    "Full Stack Developer": ["Full Stack Developer", "Frontend Developer", "Backend Developer"],
    "React Developer": ["Frontend Developer", "Full Stack Developer", "Software Developer"],
    "Java Developer": ["Java Developer", "Backend Developer", "Software Developer"],
    "Python Developer": ["Python Developer", "Backend Developer", "Data Scientist"],
    "Data Science": ["Data Scientist", "Data Analyst", "Machine Learning Engineer"],
    "Machine Learning Engineer": ["Machine Learning Engineer", "AI/ML Specialist", "Data Scientist"],
    "AI Engineer": ["AI/ML Specialist", "Machine Learning Engineer", "Data Scientist"],
    "DevOps": ["DevOps Engineer", "Site Reliability Engineer", "Cloud Engineer"],
    "Cloud Engineer": ["Cloud Engineer", "DevOps Engineer", "System Administrator"],
    "QA Engineer": ["QA Engineer", "Software Developer", "Testing"],
    "Testing": ["QA Engineer", "Software Developer"],
    "Mobile Developer": ["Mobile App Developer", "Software Developer"],
    "Product Manager": ["Product Manager", "Business Analyst"],
    "Business Analyst": ["Business Analyst", "Product Manager", "Data Analyst"],
    "Cybersecurity Analyst": ["Cybersecurity Analyst", "Network Security Engineer"],
    "Database Administrator": ["Database Administrator", "SQL Developer"],
    "SQL Developer": ["SQL Developer", "Database Administrator", "Backend Developer"],
    "Software Developer": ["Software Developer", "Full Stack Developer", "Backend Developer"],
    "DotNet Developer": ["Software Developer", "Backend Developer"],
    "Technical Writer": ["Technical Writer"],
    "Digital Media": ["Web Designer", "UI/UX Designer", "Content Writer"],
}

_skills_dict = None
_jobs_df = None
_classifier = None
_doc2vec = None
_embedding = None
_resources_loaded = False


def readiness_level(match_pct: float) -> str:
    if match_pct >= 80:
        return "Strong match"
    if match_pct >= 60:
        return "Moderate match"
    return "Needs improvement"


def _ensure_resources() -> None:
    global _skills_dict, _jobs_df, _classifier, _doc2vec, _embedding, _resources_loaded
    if _resources_loaded:
        return
    _skills_dict = load_skills_dictionary()
    _jobs_df = load_job_roles()

    clf_path = MODELS_DIR / "category_classifier.joblib"
    if clf_path.exists():
        import joblib

        _classifier = joblib.load(clf_path)

    d2v_path = MODELS_DIR / "doc2vec.model"
    if d2v_path.exists():
        try:
            from src.matching.doc2vec_matcher import load_model

            _doc2vec = load_model(str(d2v_path))
        except Exception:
            _doc2vec = None

    try:
        from src.matching.embedding_matcher import get_model

        _embedding = get_model()
    except Exception:
        _embedding = None

    _resources_loaded = True


def list_job_titles() -> list[str]:
    _ensure_resources()
    return sorted(_jobs_df["Job Title"].unique().tolist())


def _map_category_to_jobs(category: str | None) -> list[str]:
    if not category:
        return []
    mapped = _CATEGORY_TO_JOBS.get(category, [])
    if mapped:
        return mapped
    # Fuzzy: if category string appears as a job title, use it
    titles = set(_jobs_df["Job Title"].unique().tolist())
    if category in titles:
        return [category]
    for title in titles:
        if category.lower() in title.lower() or title.lower() in category.lower():
            return [title]
    return []


def _build_role_prediction(
    resume_skills: set[str],
    selected_title: str,
    selected_match: float,
    predicted_category: str | None,
    category_confidence: float | None,
) -> dict[str, Any]:
    """Pick the best job-role prediction from skill overlap (+ classifier hint)."""
    ranked = suggest_related_roles(
        resume_skills,
        _jobs_df,
        _skills_dict,
        exclude_title=None,
        top_n=8,
    )

    # Ensure selected role appears in ranking context
    selected_entry = next((r for r in ranked if r["job_title"] == selected_title), None)
    if selected_entry is None:
        req = get_required_skills(selected_title, _jobs_df)
        cmp = compare_skills(resume_skills, req, _skills_dict)
        selected_entry = {
            "job_title": selected_title,
            "match_percentage": cmp["match_percentage"],
            "matched_count": len(cmp["matched_skills"]),
            "required_count": len(req),
            "matched_skills": cmp["matched_skills"],
            "missing_skills": cmp["missing_skills"],
        }

    mapped_from_classifier = [
        t for t in _map_category_to_jobs(predicted_category) if t in set(_jobs_df["Job Title"])
    ]

    # Prefer highest skill-match role; break ties using classifier-mapped titles
    best = ranked[0] if ranked else selected_entry
    if ranked and mapped_from_classifier:
        mapped_ranked = [r for r in ranked if r["job_title"] in mapped_from_classifier]
        if mapped_ranked and mapped_ranked[0]["match_percentage"] >= best["match_percentage"] - 15:
            # Classifier agrees with a near-top skill match — prefer that signal
            best = mapped_ranked[0]

    alternatives = [r for r in ranked if r["job_title"] != best["job_title"]][:4]

    reason_parts = [
        f"Best skill overlap among {len(_jobs_df['Job Title'].unique())} job roles "
        f"({best['matched_count']}/{best['required_count']} required skills matched)."
    ]
    if predicted_category:
        conf = f" ({category_confidence:.0%} confidence)" if category_confidence is not None else ""
        reason_parts.append(
            f"Resume classifier tagged your CV as “{predicted_category}”{conf}."
        )
        if mapped_from_classifier:
            reason_parts.append(
                "Mapped classifier label to job roles: " + ", ".join(mapped_from_classifier) + "."
            )

    return {
        "best_job_title": best["job_title"],
        "confidence": float(best["match_percentage"]),
        "readiness_level": readiness_level(float(best["match_percentage"])),
        "matched_skills": best.get("matched_skills", []),
        "missing_skills": best.get("missing_skills", []),
        "reason": " ".join(reason_parts),
        "alternatives": [
            {
                "job_title": a["job_title"],
                "match_percentage": a["match_percentage"],
                "matched_count": a["matched_count"],
                "required_count": a["required_count"],
            }
            for a in alternatives
        ],
        "selected_job_title": selected_title,
        "selected_match_percentage": float(selected_match),
        "classifier_label": predicted_category,
        "classifier_confidence": category_confidence,
        "classifier_mapped_roles": mapped_from_classifier,
    }


def analyze_resume(file_path: str, job_title: str) -> dict[str, Any]:
    _ensure_resources()
    if job_title not in set(_jobs_df["Job Title"]):
        raise ValueError(f"Unknown job title: {job_title}")

    extraction = extract_text(file_path)
    resume_text_raw = extraction.text
    if len(resume_text_raw.strip()) < 50:
        raise ValueError(
            "Very little text could be extracted. Check the file is not corrupted, "
            "password-protected, or a low-quality scan without OCR tooling installed."
        )

    cleaned_text = preprocess(resume_text_raw, do_lemmatize=False)
    resume_skills = extract_skills(resume_text_raw, _skills_dict)
    required_skills = get_required_skills(job_title, _jobs_df)
    skill_comparison = compare_skills(resume_skills, required_skills, _skills_dict)

    job_row = _jobs_df[_jobs_df["Job Title"] == job_title].iloc[0]
    job_description = (
        f"{job_row['Job Title']}. Category: {job_row['Category']}. "
        f"Required skills: {str(job_row['Required Skills']).replace('|', ', ')}."
    )

    scores: dict[str, float | None] = {
        "tfidf": tfidf_similarity(cleaned_text, job_description),
        "doc2vec": None,
        "embedding": None,
    }

    if _doc2vec is not None:
        from src.matching.doc2vec_matcher import doc2vec_similarity

        scores["doc2vec"] = doc2vec_similarity(_doc2vec, cleaned_text, job_description)

    if _embedding is not None:
        from src.matching.embedding_matcher import embedding_similarity

        scores["embedding"] = embedding_similarity(resume_text_raw, job_description, _embedding)

    predicted_category = None
    category_confidence: float | None = None
    shap_terms: list[dict[str, Any]] = []
    if _classifier is not None:
        predicted_category = str(_classifier.predict([resume_text_raw])[0])
        try:
            probs = _classifier.predict_proba([resume_text_raw])[0]
            classes = list(_classifier.classes_)
            idx = classes.index(predicted_category)
            category_confidence = float(probs[idx])
        except Exception:
            category_confidence = None
        try:
            import pandas as pd
            from src.classification.explainability import build_explainer, explain_resume

            train_sample = pd.read_csv(DATA_DIR / "labelled_resumes_clean.csv")["resume_text"].sample(
                100, random_state=42
            )
            explainer, vectorizer, clf = build_explainer(_classifier, train_sample.tolist())
            explanation = explain_resume(
                resume_text_raw, _classifier, explainer, vectorizer, clf
            )
            shap_terms = [
                {"term": t, "value": float(v)}
                for t, v in explanation["top_contributing_terms"]
            ]
        except Exception:
            shap_terms = []

    match_pct = float(skill_comparison["match_percentage"])
    missing = list(skill_comparison["missing_skills"])
    suggestion = (
        f"To improve readiness for {job_title}, focus on developing: {', '.join(missing)}."
        if missing
        else f"No missing required skills detected for {job_title}. Strong alignment!"
    )

    role_prediction = _build_role_prediction(
        resume_skills,
        job_title,
        match_pct,
        predicted_category,
        category_confidence,
    )
    related_roles = role_prediction["alternatives"]

    return {
        "job_title": job_title,
        "extraction_method": extraction.method,
        "ocr_used": extraction.ocr_used,
        "warnings": extraction.warnings,
        "scores": scores,
        "skill_match_percentage": match_pct,
        "readiness_level": readiness_level(match_pct),
        "matched_skills": list(skill_comparison["matched_skills"]),
        "missing_skills": missing,
        "resume_skills": sorted(resume_skills),
        "predicted_category": predicted_category,
        "category_confidence": category_confidence,
        "role_prediction": role_prediction,
        "related_roles": related_roles,
        "shap_terms": shap_terms,
        "suggestion": suggestion,
        "excerpt": resume_text_raw[:400],
    }
