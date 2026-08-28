"""
Skill extraction module.

Loads data/skills_dictionary.json, which maps a canonical skill name to a
list of surface-form aliases (e.g. "power bi" -> ["power bi", "powerbi"]).
Matching is done with word-boundary-safe regex so "r" doesn't match inside
"experience", and multi-word aliases like "power bi" are matched as phrases.

If spaCy is available, a PhraseMatcher is used instead for more robust,
tokenizer-aware matching. Both paths return the same output format so the
rest of the pipeline doesn't care which one ran.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import pandas as pd

DEFAULT_DICT_PATH = Path(__file__).resolve().parents[2] / "data" / "skills_dictionary.json"
DEFAULT_JOB_ROLES_PATH = Path(__file__).resolve().parents[2] / "data" / "job_roles.csv"

try:
    import spacy
    from spacy.matcher import PhraseMatcher

    _NLP = spacy.load("en_core_web_sm")
except Exception:
    _NLP = None

# Soft / compound equivalences so role labels like "HTML/CSS" still match a
# resume that lists HTML and CSS separately (and vice versa).
_RELATED_SKILLS: dict[str, set[str]] = {
    "html/css": {"html", "css", "html/css", "html css"},
    "html": {"html", "html/css", "html css"},
    "css": {"css", "html/css", "html css"},
    "ui/ux design": {"ui/ux design", "ui/ux", "ui ux", "user experience", "ux", "ui"},
    "ui/ux": {"ui/ux", "ui/ux design", "user experience", "ux", "ui"},
    "user experience": {"user experience", "ui/ux design", "ui/ux", "ux"},
    "web design": {
        "web design",
        "html",
        "css",
        "html/css",
        "responsive design",
        "ui/ux design",
        "ui/ux",
        "javascript",
        "figma",
    },
    "responsive design": {
        "responsive design",
        "responsive",
        "media queries",
        "html",
        "css",
        "html/css",
    },
    "design tools": {
        "design tools",
        "figma",
        "sketch",
        "adobe xd",
        "photoshop",
        "illustrator",
        "canva",
        "adobe photoshop",
        "adobe illustrator",
    },
}


def load_skills_dictionary(path: Path = DEFAULT_DICT_PATH) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _regex_extract(text: str, skills_dict: dict) -> set[str]:
    text_lower = text.lower()
    found = set()
    for canonical, aliases in skills_dict.items():
        for alias in aliases:
            pattern = r"(?<![a-zA-Z0-9])" + re.escape(alias) + r"(?![a-zA-Z0-9])"
            if re.search(pattern, text_lower):
                found.add(canonical)
                break
    return found


def _spacy_extract(text: str, skills_dict: dict) -> set[str]:
    matcher = PhraseMatcher(_NLP.vocab, attr="LOWER")
    for canonical, aliases in skills_dict.items():
        patterns = [_NLP.make_doc(alias) for alias in aliases]
        matcher.add(canonical, patterns)

    doc = _NLP(text)
    matches = matcher(doc)
    found = {_NLP.vocab.strings[match_id] for match_id, start, end in matches}
    return found


def extract_skills(text: str, skills_dict: dict | None = None) -> set[str]:
    if skills_dict is None:
        skills_dict = load_skills_dictionary()
    if _NLP is not None:
        return _spacy_extract(text, skills_dict)
    return _regex_extract(text, skills_dict)


def _normalize_skill(skill: str) -> str:
    return re.sub(r"[^a-z0-9+#.]+", " ", skill.lower()).strip()


def _skill_token_set(skill: str, skills_dict: dict | None = None) -> set[str]:
    """Expand a skill into comparable tokens (aliases, slash-parts, relatives)."""
    tokens: set[str] = set()
    raw = skill.strip()
    if not raw:
        return tokens

    tokens.add(raw.lower())
    tokens.add(_normalize_skill(raw))

    for part in re.split(r"[/|&]", raw):
        part = part.strip()
        if part:
            tokens.add(part.lower())
            tokens.add(_normalize_skill(part))

    if skills_dict:
        for canonical, aliases in skills_dict.items():
            if _normalize_skill(canonical) == _normalize_skill(raw) or canonical.lower() == raw.lower():
                tokens.add(_normalize_skill(canonical))
                tokens.update(_normalize_skill(a) for a in aliases)
                tokens.update(a.lower() for a in aliases)

    related = _RELATED_SKILLS.get(_normalize_skill(raw), set())
    tokens.update(related)
    return {t for t in tokens if t}


def compare_skills(
    resume_skills: set[str],
    required_skills: list[str],
    skills_dict: dict | None = None,
) -> dict:
    """Compare extracted resume skills against a job role's required skills.

    Matching is case-insensitive and alias-aware:
    - "HTML" on a resume satisfies required "HTML/CSS"
    - "UI/UX Design" satisfies required "User Experience"
    - dictionary aliases are honoured when skills_dict is provided
    """
    if skills_dict is None:
        try:
            skills_dict = load_skills_dictionary()
        except Exception:
            skills_dict = {}

    resume_tokens: set[str] = set()
    for skill in resume_skills:
        resume_tokens |= _skill_token_set(skill, skills_dict)

    matched, missing = [], []
    for skill in required_skills:
        req_tokens = _skill_token_set(skill, skills_dict)
        if resume_tokens & req_tokens:
            matched.append(skill)
            continue

        parts = [p.strip() for p in re.split(r"[/|&]", skill) if p.strip()]
        if len(parts) > 1 and all(
            resume_tokens & _skill_token_set(part, skills_dict) for part in parts
        ):
            matched.append(skill)
            continue

        missing.append(skill)

    match_pct = round(100 * len(matched) / max(len(required_skills), 1), 1)
    return {
        "matched_skills": sorted(matched),
        "missing_skills": sorted(missing),
        "match_percentage": match_pct,
    }


def load_job_roles(path: Path = DEFAULT_JOB_ROLES_PATH) -> pd.DataFrame:
    """Loads the real job_roles.csv reference dataset (324 roles across 41
    industry categories, pipe-delimited Required Skills column)."""
    return pd.read_csv(path)


def get_required_skills(job_title: str, jobs_df: pd.DataFrame | None = None) -> list[str]:
    if jobs_df is None:
        jobs_df = load_job_roles()
    row = jobs_df[jobs_df["Job Title"] == job_title]
    if row.empty:
        raise ValueError(f"Job title not found in job_roles.csv: {job_title!r}")
    return [s.strip() for s in str(row.iloc[0]["Required Skills"]).split("|") if s.strip()]


def suggest_related_roles(
    resume_skills: set[str],
    jobs_df: pd.DataFrame | None = None,
    skills_dict: dict | None = None,
    exclude_title: str | None = None,
    top_n: int = 5,
) -> list[dict]:
    """Return job titles ranked by skill-match percentage (highest first)."""
    if jobs_df is None:
        jobs_df = load_job_roles()
    suggestions = []
    for title in jobs_df["Job Title"].unique().tolist():
        if exclude_title and title == exclude_title:
            continue
        required = get_required_skills(title, jobs_df)
        cmp = compare_skills(resume_skills, required, skills_dict)
        suggestions.append(
            {
                "job_title": title,
                "match_percentage": cmp["match_percentage"],
                "matched_count": len(cmp["matched_skills"]),
                "required_count": len(required),
                "matched_skills": cmp["matched_skills"],
                "missing_skills": cmp["missing_skills"],
            }
        )
    suggestions.sort(key=lambda x: (-x["match_percentage"], -x["matched_count"]))
    # Prefer roles with at least some overlap when possible
    positive = [s for s in suggestions if s["match_percentage"] > 0]
    pool = positive if positive else suggestions
    return pool[:top_n]


if __name__ == "__main__":
    sample_resume = (
        "Experienced professional skilled in SQL, Excel, PowerBI, Python and "
        "data cleaning. Comfortable building dashboards and writing reports."
    )
    skills_dict = load_skills_dictionary()
    found = extract_skills(sample_resume, skills_dict)
    print("Extracted skills:", found)

    jobs_df = load_job_roles()
    required = get_required_skills("Data Scientist", jobs_df)
    print("Data Scientist requires:", required)
    result = compare_skills(found, required, skills_dict)
    print(result)
