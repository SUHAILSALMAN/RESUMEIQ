# Project Plan: Responding to Supervisor Feedback

## 1. Feedback summary

Your original proposal was assessed as a strong, well-scoped problem
statement, but with a methodology described as "highly simplistic, baseline
statistical approaches" — appropriate for a Software Engineering capstone,
but not sufficient algorithmic depth for a **BSc (Hons) Data Science**
dissertation. Four concrete gaps were named:

1. Flat literal string similarity (TF-IDF only) — no semantic embeddings.
2. No OCR fallback — the text extraction layer fails on scanned resumes.
3. No correction for class imbalance in the classification training data.
4. No model interpretability layer.

## 2. How each point is addressed in this codebase


The supervisor feedback has been addressed through the following implemented
components:

| Supervisor feedback | Technical response | Current status |
|---|---|---|
| TF-IDF-only matching was too simplistic | TF-IDF was retained as the primary validated baseline, with Doc2Vec and Sentence-Transformer matching implementations added as additional experimental approaches | Implemented |
| No OCR fallback | Added OCR fallback using Tesseract for scanned/image-based PDF resumes | Completed |
| No class-imbalance correction | Added SMOTE to the classifier training pipeline | Completed |
| No model interpretability | Added SHAP-based explainability for the Logistic Regression classifier | Implemented |

The final system therefore extends the original baseline with OCR,
class-balancing and model-explainability components while retaining TF-IDF as
the primary validated resume-to-job matching approach.


## 3. Why these specific technical choices (for your methodology write-up)

- **Doc2Vec vs Word2Vec**: the task needs a similarity score between two
  whole documents (a resume and a job description), not individual word
  similarities. Doc2Vec learns a fixed-length vector per document directly,
  which is a more direct fit than averaging Word2Vec word vectors.
- **all-MiniLM-L6-v2** for the Sentence-Transformer: strong accuracy/speed
  trade-off, runs on CPU, ~80MB — consistent with the technical feasibility
  constraint in your proposal (no GPU required).
- **SMOTE over random oversampling**: SMOTE generates synthetic points by
  interpolating between real minority-class neighbours in feature space,
  rather than duplicating rows, which reduces overfitting to specific
  minority examples.
- **SHAP LinearExplainer over KernelExplainer**: because Logistic Regression
  is linear, LinearExplainer computes exact Shapley values from the model
  coefficients rather than approximating them — faster and more defensible
  than treating the classifier as a black box it isn't.


## 4. What the real datasets look like (for your data section)

ResumeIQ uses two main datasets.

### Resume Classification Dataset

- `data/resumes_dataset.jsonl`: approximately 3,500 labelled resumes across
  36 resume/job-title categories.
- The dataset combines the ResumeAtlas-sourced corpus with synthetically
  generated resume records.
- The dataset is imbalanced, with some categories containing considerably
  fewer examples than others.
- The largest classes contain approximately 200 resumes, while the smallest
  classes contain substantially fewer training examples.

The imbalance identified during data preparation motivated the use of SMOTE
during classifier training.

### Job Role Dataset

- `data/job_roles.csv`: 324 job roles across 41 job categories.
- The dataset contains job requirements including skills, education,
  experience and salary-related information.
- The skill taxonomy derived from the job-role dataset contains approximately
  764 unique skills.

### Data Quality

Two important data-quality issues were identified and handled during
preparation:

1. Repeated boilerplate contact information was removed from resume text.
2. The original `Skills` field was found to contain unreliable repeated
   values, so skills are extracted from resume text using the project's
   skill taxonomy rather than relying on that field.

These data-quality findings and the associated preprocessing steps are
documented as part of the methodology.

## 5. Already-validated results

## 5. Validated results

The following results were obtained from actual executions of the ResumeIQ
pipeline using the project datasets.

### 5.1 Classification baseline

The baseline classifier used TF-IDF features followed by Logistic Regression
without SMOTE.

The baseline achieved:

- **Accuracy: 88.7%**
- **Macro-F1: 0.92**
- **36 resume categories**

This result is retained as the baseline against which the final
class-balanced classifier is compared.

### 5.2 Final SMOTE-balanced classifier

The final classification pipeline applies SMOTE only to the training data
after the train/test split.

The final pipeline is:

TF-IDF
   ↓
SMOTE
   ↓
Logistic Regression

## 6. Updated implementation phases


The original project plan was retained as the overall development structure,
but the implementation was expanded in response to the supervisor feedback.

| Phase | Weeks | Activity | Deliverable | Status |
|---|---|---|---|---|
| 1 | 1–2 | Literature review and methodology refinement | Revised literature review | Completed |
| 2 | 3 | Data preparation, cleaning and skill taxonomy generation | `labelled_resumes_clean.csv`, `skills_dictionary.json` | Completed |
| 3 | 4 | Resume extraction and OCR fallback | `text_extractor.py` + test evidence | Completed |
| 4 | 5 | TF-IDF resume-to-job baseline matching | `tfidf_matcher.py` + benchmark | Completed |
| 5 | 6–7 | Additional Doc2Vec and Sentence-Transformer matching implementations | Additional matching implementations | Implemented |
| 6 | 8 | SMOTE-balanced Logistic Regression classifier | Trained classifier + evaluation report | Completed |
| 7 | 9 | SHAP-based model explainability | `explainability.py` + explanation output | Implemented |
| 8 | 10 | React frontend and FastAPI backend integration | Working web application | Completed |
| 9 | 11 | System and user testing | Testing evidence and results | Completed |
| 10 | 12 | Final evaluation, limitations and dissertation write-up | Dissertation + final demonstration | Completed |

## 7. Final implementation and evaluation status

The main implementation and evaluation activities have now been completed.

### Machine Learning

- TF-IDF resume-to-job matching implemented and benchmarked.
- Logistic Regression classifier implemented.
- SMOTE integrated into the classifier training pipeline.
- Final classifier trained using the prepared resume dataset.
- Final classifier evaluated on an untouched test set of 661 samples.
- Confusion matrix generated.
- SHAP explainability implemented.

### Resume Processing

- PDF text extraction implemented.
- DOCX text extraction implemented.
- OCR fallback implemented for scanned/image-based PDF resumes.
- Resume preprocessing and normalization implemented.
- Skill extraction implemented using the generated skill taxonomy.

### Application

- React frontend implemented as the primary user interface.
- FastAPI implemented as the primary backend.
- User registration and login implemented.
- Protected analysis functionality implemented.
- Resume upload and analysis implemented.
- Analysis history implemented.
- JSON file-based persistence implemented.

### Final Classification Results

The final TF-IDF + SMOTE + Logistic Regression classifier achieved:

- **90.17% accuracy**
- **93.53% macro precision**
- **93.27% macro recall**
- **93.27% macro F1**

The pre-SMOTE baseline achieved **88.7% accuracy** and **0.92 macro-F1**.

The final model therefore improved classification accuracy by **1.47 percentage
points** over the baseline.

### Primary Matching Results

The validated TF-IDF retrieval benchmark achieved:

- **MRR: 0.76**
- **Precision@5: 0.84**

using 128 sampled resumes against 324 job roles.

### Current Persistence Approach

The dissertation prototype uses lightweight JSON file-based persistence:

- `data/users.json` — registered user records
- `data/analyses.json` — completed analysis records

These files are excluded from version control because they may contain
user-specific information.

A production deployment could migrate this persistence layer to a relational
or managed database.

---

## 8. Final system status

The final ResumeIQ prototype integrates the following components:

``text
React Frontend
       ↓
FastAPI Backend
       ↓
Authentication
       ↓
Resume Upload
       ↓
Text Extraction / OCR
       ↓
Text Preprocessing
       ↓
Skill Extraction
       ↓
TF-IDF Resume-to-Job Matching
       ↓
Logistic Regression Classification
       ↓
SHAP Explainability
       ↓
Career Readiness Analysis
       ↓
JSON File Persistence
       ↓
Analysis History
