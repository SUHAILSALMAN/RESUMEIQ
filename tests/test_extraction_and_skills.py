"""
Basic tests for the extraction, preprocessing and skill-matching modules.
Run with: pytest tests/
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.preprocessing.text_cleaner import basic_clean, preprocess
from src.skills.skill_extractor import (
    load_skills_dictionary,
    extract_skills,
    compare_skills,
    load_job_roles,
    get_required_skills,
)
from src.matching.tfidf_matcher import tfidf_similarity


def test_basic_clean_keeps_tech_tokens():
    text = "Skilled in C++, Node.js and Power-BI!"
    cleaned = basic_clean(text)
    assert "c++" in cleaned
    assert "power-bi" in cleaned


def test_preprocess_removes_stopwords():
    result = preprocess("I am an experienced analyst with the skills", do_lemmatize=False)
    assert "the" not in result.split()
    assert "analyst" in result


def test_skill_extraction_finds_known_skills():
    skills_dict = load_skills_dictionary()
    text = "Experienced with Python, SQL and Power BI dashboards."
    found = extract_skills(text, skills_dict)
    assert "Python" in found
    assert "SQL" in found


def test_compare_skills_computes_percentage():
    result = compare_skills({"Python", "SQL"}, ["Python", "SQL", "Excel", "Power BI"])
    assert result["match_percentage"] == 50.0
    assert set(result["matched_skills"]) == {"Python", "SQL"}
    assert set(result["missing_skills"]) == {"Excel", "Power BI"}


def test_compare_skills_matches_html_to_html_css():
    """Frontend CVs list HTML/CSS separately; Web Designer requires HTML/CSS."""
    result = compare_skills(
        {"HTML", "CSS", "JavaScript", "React"},
        ["Web Design", "HTML/CSS", "Design Tools", "User Experience", "Responsive Design", "Creativity"],
    )
    assert "HTML/CSS" in result["matched_skills"]
    assert "Web Design" in result["matched_skills"]
    assert result["match_percentage"] > 0


def test_job_roles_loader_returns_known_role():
    jobs_df = load_job_roles()
    skills = get_required_skills("Data Scientist", jobs_df)
    assert "Python" in skills
    assert len(skills) > 0


def test_tfidf_similarity_ranks_relevant_text_higher():
    resume = "skilled in sql excel power bi python data visualization reporting"
    close_job = "looking for sql excel power bi python data visualization dashboards"
    unrelated_job = "chef needed with cooking and kitchen management experience"
    assert tfidf_similarity(resume, close_job) > tfidf_similarity(resume, unrelated_job)


if __name__ == "__main__":
    import pytest

    raise SystemExit(pytest.main([__file__, "-v"]))
