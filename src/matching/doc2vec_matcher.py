"""
Word-vector matcher using Doc2Vec (gensim).

Addresses reviewer feedback point 1: benchmark "word vector embeddings
(like Word2Vec or Doc2Vec)" against the TF-IDF baseline.

Doc2Vec (Le & Mikolov, 2014) extends Word2Vec by learning a fixed-length
vector for an entire document, not just individual words, which is what we
need to compare a whole resume against a whole job description. Because the
corpus here (resumes + job descriptions) is small, the model is trained on
the fly on the combined corpus passed in; in production this would instead
be trained once offline on a larger resume + job-description corpus and
loaded from disk (see train_and_save below).

Requires: pip install gensim
"""

from __future__ import annotations

try:
    from gensim.models.doc2vec import Doc2Vec, TaggedDocument
except ImportError as exc:  # pragma: no cover
    raise ImportError(
        "gensim is required for the Doc2Vec matcher. Install it with: pip install gensim"
    ) from exc

import numpy as np


def _tokenize(text: str) -> list[str]:
    return text.lower().split()


def train_doc2vec(corpus: list[str], vector_size: int = 100, epochs: int = 40, seed: int = 42) -> Doc2Vec:
    """Train a Doc2Vec model on an arbitrary text corpus (e.g. all resumes +
    all job descriptions available at training time)."""
    tagged_docs = [TaggedDocument(words=_tokenize(doc), tags=[str(i)]) for i, doc in enumerate(corpus)]
    model = Doc2Vec(
        vector_size=vector_size,
        min_count=1,
        epochs=epochs,
        seed=seed,
        workers=1,  # deterministic training for reproducible dissertation results
    )
    model.build_vocab(tagged_docs)
    model.train(tagged_docs, total_examples=model.corpus_count, epochs=model.epochs)
    return model


def save_model(model: Doc2Vec, path: str) -> None:
    model.save(path)


def load_model(path: str) -> Doc2Vec:
    return Doc2Vec.load(path)


def doc2vec_similarity(model: Doc2Vec, text_a: str, text_b: str) -> float:
    """Infers vectors for two new texts and returns their cosine similarity,
    scaled 0-100."""
    vec_a = model.infer_vector(_tokenize(text_a))
    vec_b = model.infer_vector(_tokenize(text_b))
    cos_sim = np.dot(vec_a, vec_b) / (np.linalg.norm(vec_a) * np.linalg.norm(vec_b) + 1e-10)
    return round(float(cos_sim) * 100, 2)


if __name__ == "__main__":
    corpus = [
        "skilled in sql excel power bi python data visualization reporting",
        "looking for sql excel power bi python data visualization dashboards",
        "software developer with java git object oriented programming testing",
    ]
    model = train_doc2vec(corpus)
    score = doc2vec_similarity(model, corpus[0], corpus[1])
    print("Doc2Vec similarity (matching pair):", score)
    score2 = doc2vec_similarity(model, corpus[0], corpus[2])
    print("Doc2Vec similarity (mismatched pair):", score2)
