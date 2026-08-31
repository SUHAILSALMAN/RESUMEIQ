import pandas as pd

from src.classification.explainability import (
    load_pipeline,
    build_explainer,
    explain_resume,
)
from src.preprocessing.text_cleaner import preprocess


# Load the existing trained pipeline
pipeline = load_pipeline()

# Load dataset only to create the SHAP background sample
df = pd.read_csv("data/labelled_resumes_clean.csv")

# Use preprocessed training-style text for the SHAP background
background_sample = (
    df["resume_text"]
    .astype(str)
    .apply(preprocess)
    .sample(100, random_state=42)
    .tolist()
)

# Create SHAP explainer
explainer, vectorizer, clf = build_explainer(
    pipeline,
    background_sample
)

# Anonymised demonstration resume
sample_resume = """
Professional Summary

Software developer with experience in Python programming,
machine learning, data analysis and software development.
Experienced in developing data-driven applications and
working with SQL databases.

Technical Skills

Python
Machine Learning
Data Analysis
SQL
Pandas
NumPy
Scikit-learn
Git
Jupyter Notebook
REST API
Software Development

Professional Experience

Developed Python-based applications and machine learning
solutions. Performed data preprocessing, exploratory data
analysis and model evaluation. Worked with SQL databases
and developed software components for data-driven systems.
"""

# Apply the same preprocessing used during model training
sample_resume = preprocess(sample_resume)

# Generate explanation
result = explain_resume(
    sample_resume,
    pipeline,
    explainer,
    vectorizer,
    clf,
    top_n=10,
)

print()
print("========================================")
print("ResumeIQ SHAP Explainability Evaluation")
print("========================================")
print()
print("Predicted category:", result["predicted_category"])
print()
print("Top contributing terms:")

for term, value in result["top_contributing_terms"]:
    direction = "+" if value > 0 else "-"
    print(f"  {direction} {term}: {value:.4f}")

print()
print("Evaluation completed successfully.")