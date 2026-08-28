"""
Text preprocessing utilities.

Deliberately uses sklearn's bundled ENGLISH_STOP_WORDS instead of
nltk.download('stopwords') / spaCy's downloadable models, because those
require an internet connection at run time. This keeps the pipeline
reproducible on any machine (including offline marking environments)
without extra setup steps. If spaCy is installed with a model
(en_core_web_sm), the lemmatizer below will use it automatically for
better quality; otherwise it degrades gracefully to a simple cleaner.
"""

from __future__ import annotations

import re

from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

try:
    import spacy

    _NLP = spacy.load("en_core_web_sm")
except Exception:  # spaCy not installed or model not downloaded
    _NLP = None

_WORD_RE = re.compile(r"[a-zA-Z][a-zA-Z\+\#\.\-]*[a-zA-Z]|[a-zA-Z]")


def basic_clean(text: str) -> str:
    """Lowercase, strip non-informative characters, collapse whitespace.
    Keeps characters like '+', '#', '.', '-' so tokens such as 'c++',
    'c#', 'node.js', 'power-bi' are not mangled."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\+\#\.\-\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize(text: str) -> list[str]:
    return _WORD_RE.findall(text)


def remove_stopwords(tokens: list[str]) -> list[str]:
    return [t for t in tokens if t not in ENGLISH_STOP_WORDS and len(t) > 1]


def lemmatize(tokens: list[str]) -> list[str]:
    if _NLP is None:
        return tokens  # graceful degradation, no lemmatization applied
    doc = _NLP(" ".join(tokens))
    return [t.lemma_ for t in doc]


def preprocess(text: str, do_lemmatize: bool = True) -> str:
    """Full pipeline: clean -> tokenize -> remove stopwords -> (optional) lemmatize.
    Returns a single cleaned string, ready for TF-IDF / embedding models."""
    cleaned = basic_clean(text)
    tokens = tokenize(cleaned)
    tokens = remove_stopwords(tokens)
    if do_lemmatize:
        tokens = lemmatize(tokens)
    return " ".join(tokens)


if __name__ == "__main__":
    sample = "Experienced Data Analyst! Skilled in SQL, Excel, Power-BI, and Python (data-visualization)."
    print("Raw     :", sample)
    print("Cleaned :", preprocess(sample))
