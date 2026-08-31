import pandas as pd
import joblib
import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay

from src.classification.train_classifier import load_clean_dataset
from src.preprocessing.text_cleaner import preprocess


# Load the existing cleaned dataset
df = load_clean_dataset()

# Apply the same preprocessing used during training
df["resume_text"] = (
    df["resume_text"]
    .astype(str)
    .apply(preprocess)
)

# Reproduce the same 80/20 stratified test split
X_train, X_test, y_train, y_test = train_test_split(
    df["resume_text"],
    df["category"],
    test_size=0.2,
    random_state=42,
    stratify=df["category"],
)

# Load the existing trained model
model = joblib.load("models/category_classifier.joblib")

# Predict the held-out test set
y_pred = model.predict(X_test)

# Create confusion matrix
labels = sorted(df["category"].unique())

cm = confusion_matrix(
    y_test,
    y_pred,
    labels=labels
)

# Create figure
fig, ax = plt.subplots(figsize=(18, 16))

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=labels
)

disp.plot(
    ax=ax,
    xticks_rotation=90,
    colorbar=False
)

ax.set_title(
    "ResumeIQ Job-Category Classification Confusion Matrix"
)

plt.tight_layout()

# Save the figure
output_path = "models/confusion_matrix.png"

plt.savefig(
    output_path,
    dpi=300,
    bbox_inches="tight"
)

print(f"Confusion matrix saved to: {output_path}")