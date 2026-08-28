"""
Job category classifier: TF-IDF + SMOTE + Logistic Regression.

Addresses reviewer feedback point 3: "applying explicit resampling controls
(such as SMOTE) to balance the tabular classification rows."

The real dataset (data/labelled_resumes_clean.csv, derived from
resumes_dataset.jsonl) is genuinely imbalanced: the largest classes (Java
Developer / Python Developer / Data Science) have 200 resumes each, the
smallest (Technical Writer) has only 20 -- a 10:1 imbalance across 36
classes. Without correction, a classifier trained on this data will be
biased toward the majority classes and will perform poorly (low recall) on
minority classes like Technical Writer or Product Manager.

SMOTE (Synthetic Minority Oversampling Technique, Chawla et al., 2002)
addresses this by generating synthetic minority-class samples in feature
space (interpolating between a minority sample and its nearest minority
neighbours) rather than naively duplicating existing rows.

IMPORTANT: SMOTE must be fit only on the TRAINING split, after the
train/test split, otherwise synthetic points derived from test-set samples
would leak into training and inflate the reported test accuracy. This
script uses imblearn's Pipeline (not sklearn's) specifically because it
correctly skips the resampling step at predict/score time.

Requires: pip install imbalanced-learn
"""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split
from src.preprocessing.text_cleaner import preprocess
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)

try:
    from imblearn.over_sampling import SMOTE
    from imblearn.pipeline import Pipeline as ImbPipeline
except ImportError as exc:  # pragma: no cover
    raise ImportError(
        "imbalanced-learn is required for SMOTE. Install it with: pip install imbalanced-learn"
    ) from exc

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
MODELS_DIR = Path(__file__).resolve().parents[2] / "models"
CLEAN_DATA_PATH = DATA_DIR / "labelled_resumes_clean.csv"


def load_clean_dataset(path=CLEAN_DATA_PATH):
    df = pd.read_csv(path)

    # Remove duplicate rows
    df = df.drop_duplicates()

    # Remove rows with missing values
    df = df.dropna(subset=["resume_text", "category"])

    # Normalize whitespace
    df["resume_text"] = (
        df["resume_text"]
        .astype(str)
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )

    # Clean category labels
    df["category"] = (
        df["category"]
        .astype(str)
        .str.strip()
    )

    # Remove empty resumes
    df = df[df["resume_text"] != ""]

    return df

def build_pipeline(min_class_count_in_train: int, max_tfidf_features: int = 5000) -> ImbPipeline:
    """Builds the TF-IDF -> SMOTE -> Logistic Regression pipeline.

    SMOTE's k_neighbors must be smaller than the smallest training class
    size, or it raises an error. We adapt k_neighbors automatically so the
    pipeline still runs on very small classes, while defaulting to the
    standard k_neighbors=5 when classes are large enough."""
    k_neighbors = max(1, min(5, min_class_count_in_train - 1))

    return ImbPipeline(
        steps=[
            ("tfidf", TfidfVectorizer(max_features=8000, ngram_range=(1, 3), min_df=2, max_df=0.85, sublinear_tf=True, stop_words="english")),
            ("smote", SMOTE(random_state=42, k_neighbors=k_neighbors)),
            ("clf", LogisticRegression(  C=4.0,  solver="saga",   max_iter=3000, class_weight="balanced")),
        ]
    )


def train_and_evaluate(df: pd.DataFrame, test_size: float = 0.2, random_state: int = 42) -> dict:
    X = df["resume_text"]
    y = df["category"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    train_class_counts = y_train.value_counts()
    print("Training set class distribution BEFORE SMOTE (smallest 5 classes):")
    print(train_class_counts.sort_values().head(5))
    print()

    pipeline = build_pipeline(min_class_count_in_train=train_class_counts.min())
    pipeline.fit(X_train, y_train)

    # Show what SMOTE did, for the dissertation's methodology/evaluation section.
    tfidf_matrix_train = pipeline.named_steps["tfidf"].transform(X_train)
    _, y_resampled = pipeline.named_steps["smote"].fit_resample(tfidf_matrix_train, y_train)
    print("Training set class distribution AFTER SMOTE (smallest 5 classes, should now be balanced):")
    print(pd.Series(y_resampled).value_counts().sort_values().head(5))
    print()

    y_pred = pipeline.predict(X_test)

    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision_macro": precision_score(y_test, y_pred, average="macro", zero_division=0),
        "recall_macro": recall_score(y_test, y_pred, average="macro", zero_division=0),
        "f1_macro": f1_score(y_test, y_pred, average="macro", zero_division=0),
    }

    print("Test set performance:")
    for k, v in metrics.items():
        print(f"  {k}: {v:.4f}")
    print()
    print("Full classification report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    cm = confusion_matrix(y_test, y_pred, labels=sorted(y.unique()))

    return {
        "pipeline": pipeline,
        "metrics": metrics,
        "confusion_matrix": cm,
        "labels": sorted(y.unique()),
        "X_test": X_test,
        "y_test": y_test,
        "y_pred": y_pred,
    }


def save_pipeline(pipeline: ImbPipeline, path: Path = MODELS_DIR / "category_classifier.joblib") -> None:
    MODELS_DIR.mkdir(exist_ok=True)
    joblib.dump(pipeline, path)
    print(f"Saved trained pipeline -> {path}")


if __name__ == "__main__":
    df = load_clean_dataset()

    print("Preprocessing resumes...")
    df["resume_text"] = (
        df["resume_text"]
        .astype(str)
        .apply(preprocess)
    )

    result = train_and_evaluate(df)
    save_pipeline(result["pipeline"])

    with open(MODELS_DIR / "classifier_metrics.json", "w") as f:
        json.dump(result["metrics"], f, indent=2)

    