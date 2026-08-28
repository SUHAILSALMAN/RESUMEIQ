"""
SHAP-based explainability for the job-category classifier.

Addresses reviewer feedback point 4: "constructing a model interpretability
layer using SHAP features directly inside the Streamlit view to visually
demonstrate variable weights to the user."

Why LinearExplainer, not KernelExplainer:
Logistic Regression is a linear model, so SHAP's LinearExplainer computes
EXACT Shapley values in closed form directly from the model's coefficients,
rather than the slow Monte Carlo approximation KernelExplainer needs for
black-box models. This is both faster (important for a live Streamlit
demo) and a stronger methodological choice to justify in the dissertation:
"because the classifier is linear, exact rather than approximate
attribution was possible."

Because the pipeline is TF-IDF -> SMOTE -> Logistic Regression, SHAP is
applied to the TF-IDF feature space (the vectorizer + classifier steps),
not the SMOTE step -- SMOTE only affects training, not inference, so at
prediction/explanation time the pipeline behaves as tfidf -> logistic
regression.

Requires: pip install shap
"""

from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np

try:
    import shap
except ImportError as exc:  # pragma: no cover
    raise ImportError("shap is required for explainability. Install it with: pip install shap") from exc

MODELS_DIR = Path(__file__).resolve().parents[2] / "models"


def load_pipeline(path: Path = MODELS_DIR / "category_classifier.joblib"):
    return joblib.load(path)


def build_explainer(pipeline, background_texts: list[str]):
    """Builds a SHAP LinearExplainer for the classifier step, using a
    background sample (recommended ~100 docs) to estimate feature means for
    the explainer's baseline. background_texts should be a sample of
    training resumes, e.g. X_train.sample(100)."""
    vectorizer = pipeline.named_steps["tfidf"]
    clf = pipeline.named_steps["clf"]

    background_matrix = vectorizer.transform(background_texts)
    explainer = shap.LinearExplainer(clf, background_matrix)
    return explainer, vectorizer, clf


def explain_resume(
    resume_text: str,
    pipeline,
    explainer,
    vectorizer,
    clf,
    top_n: int = 10,
) -> dict:
    """Returns the predicted category plus the top contributing words (by
    absolute SHAP value) for that specific prediction -- exactly what the
    Streamlit dashboard needs to show the user 'why' the system predicted
    this category."""
    x = vectorizer.transform([resume_text])
    predicted_class = pipeline.predict([resume_text])[0]
    class_index = list(clf.classes_).index(predicted_class)

    shap_values = explainer.shap_values(x)
    # shap_values shape: (n_samples, n_features, n_classes) for multi-class
    # LinearExplainer, or (n_samples, n_features) for binary.
    if shap_values.ndim == 3:
        values_for_class = shap_values[0, :, class_index]
    else:
        values_for_class = shap_values[0]

    feature_names = np.array(vectorizer.get_feature_names_out())
    x_dense = x.toarray()[0]
    nonzero_idx = np.where(x_dense != 0)[0]

    contributions = [(feature_names[i], float(values_for_class[i])) for i in nonzero_idx]
    contributions.sort(key=lambda pair: abs(pair[1]), reverse=True)
    top_contributions = contributions[:top_n]

    return {
        "predicted_category": predicted_class,
        "top_contributing_terms": top_contributions,  # list of (term, shap_value)
    }


if __name__ == "__main__":
    import pandas as pd

    pipeline = load_pipeline()
    df = pd.read_csv(MODELS_DIR.parent / "data" / "labelled_resumes_clean.csv")
    background_sample = df["resume_text"].sample(100, random_state=42).tolist()

    explainer, vectorizer, clf = build_explainer(pipeline, background_sample)

    sample_resume = df["resume_text"].iloc[0]
    result = explain_resume(sample_resume, pipeline, explainer, vectorizer, clf)
    print("Predicted category:", result["predicted_category"])
    print("Top contributing terms:")
    for term, value in result["top_contributing_terms"]:
        direction = "+" if value > 0 else "-"
        print(f"  {direction} {term}: {value:.4f}")
