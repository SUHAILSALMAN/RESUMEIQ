"""
Benchmarks TF-IDF vs Doc2Vec vs Sentence-Transformer matching quality.

Addresses reviewer feedback point 1 directly: this script is what turns
"we used embeddings" into an evidence-based comparison suitable for a BSc
Data Science dissertation's evaluation chapter.

METHODOLOGY (retrieval-style weak-label evaluation)
----------------------------------------------------
job_roles.csv has no ground-truth "this resume matches this job" labels, and
manually labelling thousands of resume-job pairs is out of scope. Instead we
use a defensible weak-label proxy that is standard in information-retrieval
evaluation: each resume already carries a human-assigned ground-truth
Category label (e.g. "Data Science"). We manually curated a mapping from
each of the 36 resume categories to the job title(s) in job_roles.csv that a
domain expert would consider a correct match (see RESUME_CATEGORY_TO_JOB_TITLES
below). Four categories (Engineering Manager, Principal Engineer, SQL
Developer, Site Reliability Engineer) have no unambiguous corresponding job
title in the 324-role reference set and are excluded from the benchmark --
this is reported as an explicit scope limitation rather than papered over.

For each sampled resume:
  1. Score its similarity against all 324 job role descriptions using each
     matching method.
  2. Rank the job roles by similarity score, descending.
  3. Record the rank of the first "correct" job role (per the mapping).

From these ranks we compute, per method:
  - MRR   (Mean Reciprocal Rank): 1/rank of the first correct match,
           averaged across resumes. Higher is better; 1.0 is a perfect
           top-1 retrieval, ~0 means the correct role is never found near
           the top.
  - P@5   (Precision at 5): fraction of resumes where a correct job role
           appears in the top 5 results. This is the practical number to
           quote, since the UI only needs the correct role to be
           *near the top*, not literally rank 1.

Run:
    python -m src.matching.benchmark --sample-per-category 5
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

DATA_DIR = Path(__file__).resolve().parents[2] / "data"

# Resume category -> list of job titles in job_roles.csv considered a
# correct match. Curated manually by inspecting both label sets; categories
# with no confident match are omitted (see module docstring).
RESUME_CATEGORY_TO_JOB_TITLES = {
    "AI Engineer": ["AI/ML Specialist", "Machine Learning Engineer"],
    "Backend Developer": ["Backend Developer", "Java Backend Developer"],
    "Blockchain": ["Blockchain Developer"],
    "Blockchain Developer": ["Blockchain Developer"],
    "Business Analyst": ["Business Analyst", "BI Analyst"],
    "Cloud Engineer": ["Cloud Architect"],
    "Cybersecurity Analyst": ["Cybersecurity Analyst", "SOC Analyst"],
    "Data Science": ["Data Scientist", "Research Scientist"],
    "Database": ["Database Administrator", "Oracle DBA"],
    "Database Administrator": ["Database Administrator", "Oracle DBA"],
    "DevOps": ["DevOps Engineer", "DevSecOps Engineer", "Release Manager"],
    "Digital Media": ["Social Media Content Creator", "Content Creator", "Digital Marketing Manager"],
    "DotNet Developer": ["C# Developer"],
    "ETL Developer": ["ETL Developer", "Talend Developer", "Informatica Developer"],
    "Frontend Developer": ["Frontend Developer", "UI Designer"],
    "Full Stack Developer": ["Full Stack Developer"],
    "Java Developer": ["Java Backend Developer", "Software Engineer"],
    "Machine Learning Engineer": ["Machine Learning Engineer", "AI/ML Specialist"],
    "Mobile Developer": ["Mobile Developer Android", "Mobile Developer iOS"],
    "Network Security Engineer": ["Security Engineer", "Network Engineer"],
    "Product Manager": ["Product Manager"],
    "Python Developer": ["Python Developer"],
    "QA Engineer": ["QA Engineer"],
    "React Developer": ["React Developer"],
    "SAP Developer": ["SAP Developer"],
    "Software Developer": ["Software Engineer", "Software Architect"],
    "System Administrator": ["Systems Administrator", "IT Field Technician"],
    "Technical Lead": ["Technical Lead"],
    "Technical Writer": ["Technical Writer"],
    "Testing": ["Software Test Engineer", "Performance Tester", "Security Tester"],
    "UI/UX Designer": ["UI Designer", "UX Designer"],
    "Web Designing": ["Web Designer"],
}
EXCLUDED_CATEGORIES = ["Engineering Manager", "Principal Engineer", "SQL Developer", "Site Reliability Engineer"]


def build_job_descriptions(jobs_df: pd.DataFrame) -> list[str]:
    """job_roles.csv has no free-text description column, so a short
    synthetic description is composed from the structured fields. This is
    exactly the kind of text a job posting would contain."""
    descriptions = []
    for _, row in jobs_df.iterrows():
        skills = str(row["Required Skills"]).replace("|", ", ")
        desc = f"{row['Job Title']}. Category: {row['Category']}. Required skills: {skills}."
        descriptions.append(desc)
    return descriptions


def sample_resumes(clean_df: pd.DataFrame, n_per_category: int, seed: int = 42) -> pd.DataFrame:
    eligible = clean_df[clean_df["category"].isin(RESUME_CATEGORY_TO_JOB_TITLES.keys())]
    parts = [
        group.sample(min(len(group), n_per_category), random_state=seed)
        for _, group in eligible.groupby("category")
    ]
    return pd.concat(parts, ignore_index=True)


def _ranks_from_scores(scores: np.ndarray, job_titles: list[str], correct_titles: list[str]) -> int | None:
    """Given similarity scores against every job role, return the 1-indexed
    rank of the first job role whose title is in correct_titles, or None if
    none of the correct titles appear (shouldn't happen since all titles
    are always present, but guards against typos in the mapping)."""
    order = np.argsort(-scores)  # descending
    ranked_titles = [job_titles[i] for i in order]
    for rank, title in enumerate(ranked_titles, start=1):
        if title in correct_titles:
            return rank
    return None


def run_tfidf_benchmark(resume_texts: list[str], job_descriptions: list[str]) -> np.ndarray:
    """Vectorizes all resumes + all job descriptions in one shared TF-IDF
    space (required so cosine similarity is meaningful across the two
    groups), returns an (n_resumes x n_jobs) similarity matrix."""
    vectorizer = TfidfVectorizer()
    all_docs = resume_texts + job_descriptions
    tfidf_matrix = vectorizer.fit_transform(all_docs)
    resume_vectors = tfidf_matrix[: len(resume_texts)]
    job_vectors = tfidf_matrix[len(resume_texts):]
    return cosine_similarity(resume_vectors, job_vectors)


def run_doc2vec_benchmark(resume_texts: list[str], job_descriptions: list[str]) -> np.ndarray:
    from src.matching.doc2vec_matcher import train_doc2vec  # local import: optional dependency

    all_docs = resume_texts + job_descriptions
    model = train_doc2vec(all_docs)
    resume_vecs = np.array([model.infer_vector(t.lower().split()) for t in resume_texts])
    job_vecs = np.array([model.infer_vector(t.lower().split()) for t in job_descriptions])
    return cosine_similarity(resume_vecs, job_vecs)


def run_embedding_benchmark(resume_texts: list[str], job_descriptions: list[str]) -> np.ndarray:
    from src.matching.embedding_matcher import batch_embed, get_model  # local import: optional dependency

    model = get_model()
    resume_vecs = batch_embed(resume_texts, model)
    job_vecs = batch_embed(job_descriptions, model)
    return cosine_similarity(resume_vecs, job_vecs)


def evaluate_method(
    score_matrix: np.ndarray,
    resume_categories: list[str],
    job_titles: list[str],
    k: int = 5,
) -> dict:
    reciprocal_ranks = []
    hits_at_k = []
    for i, category in enumerate(resume_categories):
        correct_titles = RESUME_CATEGORY_TO_JOB_TITLES[category]
        rank = _ranks_from_scores(score_matrix[i], job_titles, correct_titles)
        if rank is None:
            continue
        reciprocal_ranks.append(1.0 / rank)
        hits_at_k.append(1 if rank <= k else 0)
    return {
        "MRR": round(float(np.mean(reciprocal_ranks)), 4),
        f"Precision@{k}": round(float(np.mean(hits_at_k)), 4),
        "n_evaluated": len(reciprocal_ranks),
    }


def main(sample_per_category: int, methods: list[str]) -> pd.DataFrame:
    jobs_df = pd.read_csv(DATA_DIR / "job_roles.csv")
    job_descriptions = build_job_descriptions(jobs_df)
    job_titles = jobs_df["Job Title"].tolist()

    clean_df = pd.read_csv(DATA_DIR / "labelled_resumes_clean.csv")
    sampled = sample_resumes(clean_df, sample_per_category)
    resume_texts = sampled["resume_text"].tolist()
    resume_categories = sampled["category"].tolist()

    print(f"Benchmarking on {len(resume_texts)} resumes across {sampled['category'].nunique()} categories")
    print(f"({len(EXCLUDED_CATEGORIES)} categories excluded, no unambiguous job-title match: {EXCLUDED_CATEGORIES})")
    print()

    results = {}

    if "tfidf" in methods:
        print("Running TF-IDF ...")
        scores = run_tfidf_benchmark(resume_texts, job_descriptions)
        results["TF-IDF (baseline)"] = evaluate_method(scores, resume_categories, job_titles)

    if "doc2vec" in methods:
        print("Running Doc2Vec ...")
        scores = run_doc2vec_benchmark(resume_texts, job_descriptions)
        results["Doc2Vec"] = evaluate_method(scores, resume_categories, job_titles)

    if "embeddings" in methods:
        print("Running Sentence-Transformers ...")
        scores = run_embedding_benchmark(resume_texts, job_descriptions)
        results["Sentence-Transformers"] = evaluate_method(scores, resume_categories, job_titles)

    results_df = pd.DataFrame(results).T
    print()
    print("=== Benchmark results (higher is better for MRR and Precision@5) ===")
    print(results_df)
    return results_df


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample-per-category", type=int, default=5)
    parser.add_argument(
        "--methods",
        nargs="+",
        default=["tfidf", "doc2vec", "embeddings"],
        choices=["tfidf", "doc2vec", "embeddings"],
    )
    args = parser.parse_args()
    df = main(args.sample_per_category, args.methods)
    df.to_csv(DATA_DIR.parent / "models" / "benchmark_results.csv")
