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

| # | Feedback | Implementation | File |
|---|---|---|---|
| 1 | Benchmark contextual embeddings / word vectors against TF-IDF | Three matchers (TF-IDF baseline, Doc2Vec, Sentence-Transformers) plus a retrieval-style benchmark harness reporting MRR and Precision@5 for each | `matching/tfidf_matcher.py`, `matching/doc2vec_matcher.py`, `matching/embedding_matcher.py`, `matching/benchmark.py` |
| 2 | OCR fallback for scanned documents | Native extraction (pdfplumber/python-docx) is tried first; if the text yield is below threshold, pytesseract OCR runs automatically. Verified on both a native and a synthetic scanned PDF | `extraction/text_extractor.py` |
| 3 | Resampling for class imbalance | SMOTE inside an `imblearn` pipeline (TF-IDF → SMOTE → Logistic Regression), fit only on the training split to avoid leakage, with adaptive `k_neighbors` for very small classes | `classification/train_classifier.py` |
| 4 | Model interpretability | SHAP `LinearExplainer` (exact Shapley values, justified by the classifier being linear) surfaces the top contributing resume terms per prediction, rendered as a bar chart in the Streamlit dashboard | `classification/explainability.py`, `app/streamlit_app.py` |

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

- `data/resumes_dataset.jsonl`: 3,500 labelled resumes, 36 job-title
  categories, combining a public corpus ("ResumeAtlas", 2,337 rows) with
  synthetically generated resumes (1,163 rows). Genuinely imbalanced:
  largest classes 200 resumes, smallest (Technical Writer) 20 — a ~10:1
  ratio, which is exactly the scenario SMOTE is designed for.
- `data/job_roles.csv`: 324 job roles across 41 industry categories, with
  pipe-delimited required skills, education requirements, experience years
  and salary ranges.
- Two real data-quality issues were found and handled during preparation
  (see `README.md` "Known data caveats") — documenting this discovery-and-fix
  process is good methodology evidence for your write-up.

## 5. Already-validated results

These numbers come from runs actually executed against your real data
during development (not projected):

- **Classifier baseline** (TF-IDF + Logistic Regression, no SMOTE yet):
  88.7% accuracy, 0.92 macro-F1 across 36 classes on a held-out 20% test
  split. This is your "before" number to compare against once SMOTE is
  added — a modest or even flat improvement in aggregate accuracy is a
  legitimate finding if minority-class recall improves, since that's what
  SMOTE specifically targets. Report per-class recall before/after, not
  just aggregate accuracy.
- **TF-IDF retrieval benchmark**: MRR 0.76, Precision@5 0.84 across 128
  resumes (32 of 36 categories) ranked against all 324 job roles. This is
  the number Doc2Vec and Sentence-Transformers need to beat once you run
  `benchmark.py` with those methods installed.

## 6. Updated implementation phases

Your original 10-phase, 12-week plan is still a reasonable skeleton. The
main change is that Phases 5 (matching) and 6 (classification) now have
more sub-steps, and a new phase is needed for the benchmark comparison and
SHAP layer. Suggested revision:

| Phase | Weeks | Activity | Deliverable |
|---|---|---|---|
| 1 | 1–2 | Literature review update: cite Doc2Vec (Le & Mikolov 2014), Sentence-BERT (Reimers & Gurevych 2019), SMOTE (Chawla et al. 2002), SHAP (Lundberg & Lee 2017) | Revised literature review |
| 2 | 3 | Data preparation: boilerplate cleaning, skill taxonomy generation | `labelled_resumes_clean.csv`, `skills_dictionary.json` |
| 3 | 4 | Extraction + OCR fallback, validated on scanned test files | `text_extractor.py` + test evidence |
| 4 | 5 | TF-IDF baseline matcher (regression-test target) | `tfidf_matcher.py` |
| 5 | 6–7 | Doc2Vec + Sentence-Transformer matchers, benchmark harness | `benchmark.py` results table |
| 6 | 8 | SMOTE-balanced classifier, before/after per-class comparison | trained model + evaluation report |
| 7 | 9 | SHAP explainability layer | `explainability.py` + example plots |
| 8 | 10 | Streamlit dashboard integration | working app |
| 9 | 11 | System + user testing, collect feedback | testing report |
| 10 | 12 | Final write-up: results, limitations, evaluation | dissertation + demo |

## 7. Next steps for you, this week

1. `pip install -r requirements.txt` locally (this sandbox had no internet,
   so `gensim`, `sentence-transformers`, `imbalanced-learn`, `shap` and
   `streamlit` are untested here — but syntax-checked and ready to run).
2. Run the full pipeline in the README's "Run order" section.
3. Compare your local SMOTE/embedding results against the baseline numbers
   in Section 5 above — that comparison *is* your evaluation chapter.
