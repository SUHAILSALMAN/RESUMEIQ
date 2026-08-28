"""
Contextual embedding matcher using Sentence-Transformers.

Addresses reviewer feedback point 1: benchmark "contextual sentence
transformers ... against the basic TF-IDF script."

Unlike TF-IDF (which only counts word overlap) and Doc2Vec (which learns
static document vectors from the small local corpus), a pretrained
Sentence-Transformer (Reimers & Gurevych, 2019) encodes each sentence using
a transformer model fine-tuned for semantic similarity. This means it can
recognise that a resume mentioning "built dashboards in Power BI" is
relevant to a job description asking for "business intelligence reporting
tools" even though they share almost no exact words -- something TF-IDF
structurally cannot do.

Model choice: 'all-MiniLM-L6-v2' is used as the default because it offers a
strong accuracy/speed trade-off and runs comfortably on a laptop CPU
(384-dim embeddings, ~80MB), which matches the project's technical
feasibility constraints (no GPU required, per the proposal's Section 5.1).

Requires: pip install sentence-transformers
"""

from __future__ import annotations

import numpy as np

try:
    from sentence_transformers import SentenceTransformer
except ImportError as exc:  # pragma: no cover
    raise ImportError(
        "sentence-transformers is required for the embedding matcher. "
        "Install it with: pip install sentence-transformers"
    ) from exc

_MODEL_CACHE: dict[str, "SentenceTransformer"] = {}


def get_model(model_name: str = "all-MiniLM-L6-v2") -> "SentenceTransformer":
    """Cached model loader -- loading a Sentence-Transformer model is slow
    (it must load transformer weights), so this avoids reloading it for
    every comparison. In the Streamlit app this is additionally wrapped
    with @st.cache_resource."""
    if model_name not in _MODEL_CACHE:
        _MODEL_CACHE[model_name] = SentenceTransformer(model_name)
    return _MODEL_CACHE[model_name]


def embedding_similarity(text_a: str, text_b: str, model: "SentenceTransformer | None" = None) -> float:
    if model is None:
        model = get_model()
    embeddings = model.encode([text_a, text_b], normalize_embeddings=True)
    cos_sim = float(np.dot(embeddings[0], embeddings[1]))
    return round(cos_sim * 100, 2)


def batch_embed(texts: list[str], model: "SentenceTransformer | None" = None) -> np.ndarray:
    """Encodes many texts at once (much faster than one-by-one), used by
    benchmark.py when scoring one resume against all 324 job roles."""
    if model is None:
        model = get_model()
    return model.encode(texts, normalize_embeddings=True, show_progress_bar=False)


if __name__ == "__main__":
    resume = "built interactive dashboards in power bi and cleaned data using python and sql"
    job_desc_close_wording = "looking for sql excel power bi python data visualization dashboards"
    job_desc_paraphrased = "candidate should be comfortable with business intelligence reporting tools and scripting for data preparation"
    job_desc_unrelated = "software developer with java git object oriented programming testing"

    print("Close wording match :", embedding_similarity(resume, job_desc_close_wording))
    print("Paraphrased match   :", embedding_similarity(resume, job_desc_paraphrased))
    print("Unrelated role      :", embedding_similarity(resume, job_desc_unrelated))
