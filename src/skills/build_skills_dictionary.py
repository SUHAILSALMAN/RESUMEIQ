"""
Builds data/skills_dictionary.json automatically from the "Required Skills"
column of data/job_roles.csv (pipe-delimited, e.g. "Python|Java|Git").

Deriving the skill taxonomy programmatically from the reference dataset
(rather than hand-curating a short list) ensures coverage across every job
role and industry category present in the real dataset, and keeps the
taxonomy easy to regenerate if the reference dataset is updated.

Each canonical skill maps to a small set of surface-form aliases so that
minor formatting differences in resume text (e.g. "UI/UX Design" vs
"ui ux design", "Node.js" vs "nodejs") still match.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
JOB_ROLES_PATH = DATA_DIR / "job_roles.csv"
OUTPUT_PATH = DATA_DIR / "skills_dictionary.json"


def _generate_aliases(skill: str) -> list[str]:
    base = skill.strip().lower()
    aliases = {base}
    # Variant with punctuation replaced by spaces (handles "UI/UX Design", "A/B Testing", "C++"-safe punctuation kept)
    spaced = re.sub(r"[/\-]", " ", base)
    spaced = re.sub(r"\s+", " ", spaced).strip()
    aliases.add(spaced)
    # Variant with punctuation removed entirely (handles "Node.js" -> "nodejs")
    compact = re.sub(r"[^a-z0-9\+\#]", "", base)
    if compact:
        aliases.add(compact)
    return sorted(aliases)


def build_skills_dictionary(job_roles_path: Path = JOB_ROLES_PATH, output_path: Path = OUTPUT_PATH) -> dict:
    jobs = pd.read_csv(job_roles_path)
    all_skills = set()
    for cell in jobs["Required Skills"].dropna():
        for skill in str(cell).split("|"):
            skill = skill.strip()
            if skill:
                all_skills.add(skill)

    skills_dict = {skill: _generate_aliases(skill) for skill in sorted(all_skills)}

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(skills_dict, f, indent=2)

    return skills_dict


if __name__ == "__main__":
    result = build_skills_dictionary()
    print(f"Built skills dictionary with {len(result)} canonical skills -> {OUTPUT_PATH}")
    sample_key = next(iter(result))
    print(f"Example entry: {sample_key!r} -> {result[sample_key]}")
