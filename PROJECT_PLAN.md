# \# Project Plan: Responding to Supervisor Feedback

# 

# \## 1. Feedback summary

# 

# Your original proposal was assessed as a strong, well-scoped problem

# statement, but with a methodology described as "highly simplistic, baseline

# statistical approaches" — appropriate for a Software Engineering capstone,

# but not sufficient algorithmic depth for a \*\*BSc (Hons) Data Science\*\*

# dissertation.

# 

# Four concrete gaps were identified:

# 

# 1\. Flat literal string similarity (TF-IDF only) — no semantic approaches.

# 2\. No OCR fallback — the text extraction layer could fail on scanned resumes.

# 3\. No correction for class imbalance in the classification training data.

# 4\. No model interpretability layer.

# 

# \---

# 

# \## 2. How each point is addressed in this codebase

# 

# The supervisor feedback has been addressed through the following technical

# components:

# 

# | Supervisor feedback | Technical response | Status |

# |---|---|---|

# | TF-IDF-only matching was too simplistic | TF-IDF is retained as the primary validated baseline, while Doc2Vec and Sentence-Transformer matching implementations are available as additional experimental approaches | Implemented |

# | No OCR fallback | Native PDF/DOCX extraction is attempted first. If insufficient text is extracted from a PDF, Tesseract OCR is used as a fallback | Completed |

# | No class-imbalance correction | SMOTE is applied within the classifier training pipeline after the train/test split and only to the training data | Completed |

# | No model interpretability | SHAP-based explainability is implemented for the Logistic Regression classifier to identify influential TF-IDF features | Implemented |

# 

# The final system therefore extends the original baseline with OCR,

# class-balancing and model-explainability components while retaining TF-IDF as

# the primary validated resume-to-job matching method.

# 

# \---

# 

# \## 3. Why these specific technical choices

# 

# \### TF-IDF

# 

# TF-IDF was selected as the primary validated resume-to-job matching baseline

# because it provides a transparent, reproducible and computationally efficient

# method for comparing resume content with job-role requirements using cosine

# similarity.

# 

# \### Doc2Vec vs Word2Vec

# 

# The task requires a similarity representation between complete documents such

# as resumes and job descriptions rather than individual words. Doc2Vec learns

# a fixed-length representation for a document directly, making it a suitable

# document-level experimental approach compared with simply averaging Word2Vec

# word vectors.

# 

# \### Sentence-Transformer

# 

# The Sentence-Transformer implementation uses `all-MiniLM-L6-v2`, which provides

# a practical balance between semantic representation quality and computational

# efficiency. Its relatively small size makes it suitable for CPU-based

# experimentation without requiring a GPU.

# 

# \### SMOTE over random oversampling

# 

# SMOTE (Synthetic Minority Over-sampling Technique) was selected to address

# class imbalance. Instead of simply duplicating minority-class examples,

# SMOTE generates synthetic samples by interpolating between neighbouring

# minority-class observations in feature space.

# 

# \### SHAP LinearExplainer

# 

# The final classifier uses Logistic Regression, which is a linear model.

# SHAP-based feature contributions therefore provide an interpretable way of

# identifying TF-IDF features that influence the predicted resume category.

# 

# \---

# 

# \## 4. Dataset and data preparation

# 

# \### Resume Classification Dataset

# 

# `data/resumes\_dataset.jsonl` contains approximately:

# 

# \- \*\*3,500 labelled resumes\*\*

# \- \*\*36 resume categories\*\*

# 

# The dataset combines a public ResumeAtlas-sourced corpus with additional

# synthetically generated resume records.

# 

# The dataset contains class imbalance, with some categories containing

# substantially fewer examples than others. This imbalance motivated the use of

# SMOTE during classifier training.

# 

# \### Job Role Dataset

# 

# `data/job\_roles.csv` contains:

# 

# \- \*\*324 job roles\*\*

# \- \*\*41 job categories\*\*

# \- \*\*764 unique skills\*\* derived from the job-role requirements

# 

# The dataset contains job-role requirements such as skills, education,

# experience and salary-related information.

# 

# \### Data Quality

# 

# Two important data-quality issues were identified and handled during

# preparation:

# 

# 1\. Repeated boilerplate contact information was removed from resume text.

# 2\. The original `Skills` field in the ResumeAtlas data was found to contain

# &#x20;  unreliable repeated values. Therefore, the system extracts skills directly

# &#x20;  from resume text using the project's skill taxonomy rather than relying on

# &#x20;  that field.

# 

# These preprocessing decisions form part of the data preparation methodology.

# 

# \---

# 

# \## 5. Validated results

# 

# The following results were obtained from actual executions of the ResumeIQ

# pipeline using the project datasets.

# 

# \### 5.1 Classification baseline

# 

# The baseline classifier used TF-IDF features followed by Logistic Regression

# without SMOTE.

# 

# The baseline achieved:

# 

# \- \*\*Accuracy: 88.7%\*\*

# \- \*\*Macro-F1: 0.92\*\*

# \- \*\*36 resume categories\*\*

# 

# This baseline is retained to provide a before-and-after comparison with the

# class-balanced classifier.

# 

# \### 5.2 Final SMOTE-balanced classifier

# 

# The final classification pipeline is:

# 

# ```text

# TF-IDF

# &#x20;  ↓

# SMOTE

# &#x20;  ↓

# Logistic Regression

