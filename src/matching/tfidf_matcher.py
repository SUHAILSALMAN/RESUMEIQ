"""
Baseline matcher: TF-IDF + cosine similarity.

This is deliberately kept as the *baseline* against which the two upgraded
matchers (Doc2Vec word embeddings, Sentence-Transformer contextual
embeddings) are benchmarked in matching/benchmark.py. Keeping this baseline
in the codebase (rather than deleting it) is what lets the dissertation make
an evidence-based "technique A outperforms technique B" argument instead of
just asserting it.
"""

from __future__ import annotations

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def tfidf_similarity(text_a: str, text_b: str) -> float:
    """Fits a TF-IDF vectorizer on the two documents jointly and returns
    the cosine similarity between them, scaled 0-100."""
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
    score = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0]
    return round(float(score) * 100, 2)


if __name__ == "__main__":
    resume = "skilled in sql excel power bi python data visualization reporting"
    job_desc = "looking for sql excel power bi python data visualization dashboards"
    print("TF-IDF similarity:", tfidf_similarity(resume, job_desc))
