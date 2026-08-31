does this covers everything# ResumeIQ — AI-Powered Resume Skill Match & Career Readiness Analysis

ResumeIQ is an AI-powered resume analysis and career-readiness system developed as a BSc (Hons) Data Science dissertation project (CIS6001).

The system allows candidates to upload their resume, select a target job role, and receive an automated analysis of their skills against job requirements. ResumeIQ extracts relevant skills, calculates a skill-match score, predicts a suitable resume category, identifies skill gaps, provides a career-readiness assessment, and generates model explanations using SHAP.

\---

\## Overview

ResumeIQ follows an end-to-end resume analysis pipeline consisting of the following stages:

1\. Resume upload and validation
2\. PDF/DOCX text extraction
3\. OCR fallback for scanned/image-based resumes
4\. Text preprocessing and normalization
5\. Skill extraction using an NLP-based skill taxonomy
6\. Resume-to-job-role matching using TF-IDF
7\. Skill-match and skill-gap calculation
8\. Resume category classification using Logistic Regression
9\. SMOTE-based class balancing during model training
10\. SHAP-based model explainability
11\. Career-readiness assessment
12\. Analysis history and JSON-based persistence

The system is designed as a modular application with a React frontend, FastAPI backend, NLP/ML processing components, and lightweight JSON file-based persistence.

\---

\## System Architecture

ResumeIQ follows a layered architecture:

\`\`\`text
┌─────────────────────────────────────────────┐
│              React Frontend                 │
│                                             │
│ Register • Login • Upload • Job Selection   │
│ Results • Skill Gap • Career Readiness      │
│ SHAP Explanation • Analysis History         │
└──────────────────────┬──────────────────────┘
                       │ HTTP/JSON
                       ▼
┌─────────────────────────────────────────────┐
│              FastAPI Backend                │
│                                             │
│ Authentication • Resume Analysis API       │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             Analysis Service                │
│                                             │
│ Text Extraction / OCR                       │
│        ↓                                    │
│ Preprocessing                               │
│        ↓                                    │
│ Skill Extraction                            │
│        ↓                                    │
│ TF-IDF Resume/Job Matching                  │
│        ↓                                    │
│ Logistic Regression Classification         │
│        ↓                                    │
│ SHAP Explainability                         │
│        ↓                                    │
│ Career Readiness Assessment                 │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│        JSON File-Based Persistence          │
│                                             │
│ data/users.json                             │
│ data/analyses.json                          │
└─────────────────────────────────────────────┘
\`\`\`

\---

\## Dataset

ResumeIQ uses two main datasets.

\### Resume Classification Dataset

The classification dataset contains approximately:

\- \*\*3,500 resumes\*\*
\- \*\*36 resume categories\*\*

The dataset is prepared using \`prepare\_dataset.py\` before classifier training.

\### Job Role Dataset

The job-role dataset contains:

\- \*\*324 job roles\*\*
\- \*\*41 job categories\*\*
\- \*\*764 unique skills\*\* automatically derived from the job-role requirements

The job-role dataset is used to construct the skill taxonomy and evaluate resume-to-job-role matching.

\---

\## Data Preparation

The raw resume data undergoes preprocessing before being used for model training.

The preparation process includes:

\- Removing duplicate or irrelevant information
\- Cleaning resume text
\- Normalizing text
\- Tokenization
\- Removing common stopwords
\- Removing repeated boilerplate contact information
\- Validating resume categories
\- Preparing the labelled dataset for classification

The \`Skills\` field in the original ResumeAtlas data was not used as the primary source of skills because the field was found to contain unreliable repeated values. Instead, skills are extracted directly from resume text using the project's skill taxonomy and NLP processing.

\---

\## Resume Text Extraction

ResumeIQ supports resume document processing through:

\- PDF text extraction
\- DOCX text extraction
\- OCR fallback for scanned/image-based PDF resumes

For scanned resumes that do not contain a usable text layer, Tesseract OCR is used as a fallback mechanism.

The application validates the extracted text before continuing with analysis.

\---

\## Skill Extraction

ResumeIQ extracts skills from the resume text using a structured skill taxonomy derived from the job-role dataset.

The skill extraction process:

1\. Cleans the resume text
2\. Normalizes skill names
3\. Identifies known skills and aliases
4\. Compares extracted skills with job-role requirements
5\. Produces matched and missing skill information

This enables the system to provide a meaningful skill-gap analysis rather than relying solely on keyword frequency.

\---

\## Resume-to-Job Matching

The primary validated matching approach is \*\*TF-IDF (Term Frequency–Inverse Document Frequency)\*\* with cosine similarity.

The system compares resume content against job-role requirements and produces a relevance score.

The retrieval benchmark was evaluated using:

\- \*\*128 sampled resumes\*\*
\- \*\*324 job roles\*\*
\- \*\*MRR: 0.76\*\*
\- \*\*Precision\@5: 0.84\*\*

The TF-IDF approach is the primary validated resume-to-job matching method in the current system.

Additional matching implementations are available for Doc2Vec and sentence-transformer embeddings. These are treated as additional experimental approaches and are not part of the primary validated inference pipeline.

\---

\## Resume Category Classification

ResumeIQ uses \*\*Logistic Regression\*\* for resume category classification.

The classification pipeline uses TF-IDF features followed by Logistic Regression.

\### Baseline Model

The pre-SMOTE baseline achieved:

\- \*\*Accuracy: 88.7%\*\*
\- \*\*Macro-F1: 0.92\*\*
\- \*\*36 resume categories\*\*

This baseline is retained to measure the effect of class balancing.

\### Final Model

The final classifier applies \*\*SMOTE (Synthetic Minority Over-sampling Technique)\*\* to the training data before training the Logistic Regression classifier.

SMOTE is applied only to the training set. The test set remains unchanged to provide an unbiased evaluation of the final classifier.

The final model achieved:

\| Metric | Result |
\|---|---:|
\| Accuracy | \*\*90.17%\*\* |
\| Macro Precision | \*\*93.53%\*\* |
\| Macro Recall | \*\*93.27%\*\* |
\| Macro F1 | \*\*93.27%\*\* |
\| Test Samples | \*\*661\*\* |
\| Categories | \*\*36\*\* |

The final trained classifier is saved as:

\`\`\`text
models/category\_classifier.joblib
\`\`\`

The final evaluation metrics are stored as:

\`\`\`text
models/classifier\_metrics.json
\`\`\`

\---

\## Effect of SMOTE

The training dataset contains class imbalance, with some resume categories having fewer training examples than others.

SMOTE was applied only after the training/test split. Synthetic minority samples were generated for the training set while the original test set remained unchanged.

The classification accuracy improved from:

\`\`\`text
Pre-SMOTE baseline: 88.7%
Final SMOTE model:  90.17%
\`\`\`

This represents an absolute improvement of \*\*1.47 percentage points\*\*.

The final model achieved a macro-F1 of \*\*93.27%\*\*, indicating strong overall classification performance across the 36 resume categories.

\---

\## Model Explainability

ResumeIQ includes SHAP-based explainability for the Logistic Regression classifier.

SHAP is used to identify influential TF-IDF features contributing to the model's category prediction.

The explainability component is implemented in:

\`\`\`text
src/classification/explainability.py
\`\`\`

An evaluation helper script is also included:

\`\`\`text
run\_shap\_anonymized.py
\`\`\`

The explainability component is intended to improve transparency by providing information about the features that influence the predicted resume category.

\---

\## Career Readiness Analysis

The system combines resume-to-job matching results with extracted skill information to provide a career-readiness assessment.

The analysis includes:

\- Overall skill-match score
\- Matched skills
\- Missing skills
\- Job-role relevance
\- Predicted resume category
\- Career-readiness assessment
\- Model explanation

The purpose is to help candidates understand how well their resume matches a target role and which skills may require further development.

\---

\## Authentication

ResumeIQ provides user authentication through the FastAPI backend.

The system supports:

\- User registration
\- Login
\- Authentication tokens
\- Logout
\- Protected analysis functionality
\- User-specific analysis history

Passwords are not stored in plaintext. The current prototype uses salted password hashing.

For production deployment, a password-specific key-derivation function such as Argon2id or bcrypt would be preferable.

\---

\## Data Persistence

The current ResumeIQ dissertation prototype uses lightweight \*\*JSON file-based persistence\*\* rather than a relational database.

The main persistence files are:

\`\`\`text
data/users.json
data/analyses.json
\`\`\`

\### \`users.json\`

Stores registered user records required for authentication.

\### \`analyses.json\`

Stores completed resume-analysis records used to provide analysis history.

These files are intentionally excluded from version control because they may contain user-specific information.

For a production multi-user deployment, a relational or managed database would be more appropriate.

\---

\## Frontend

The primary ResumeIQ user interface is implemented using:

\- React
\- Vite
\- TypeScript
\- Tailwind CSS

The frontend provides:

\- Landing page
\- Registration
\- Login
\- Dashboard
\- Job-role selection
\- Resume upload
\- Resume analysis results
\- Skill-gap information
\- Career-readiness results
\- SHAP explanations
\- Analysis history

The legacy Streamlit application is retained as an earlier prototype/reference interface and is not the primary application.

\---

\## Backend

The primary backend is implemented using \*\*FastAPI\*\*.

The backend is responsible for:

\- Authentication
\- Resume upload handling
\- File validation
\- Resume analysis
\- NLP processing
\- ML classification
\- SHAP explainability
\- Analysis history
\- JSON persistence
\- Returning structured JSON responses to the React frontend

The main API implementation is located in:

\`\`\`text
src/api/main.py
\`\`\`

\---

\## Project Structure

\`\`\`text
RESUMEIQ/
│
├── data/
│   ├── job\_roles.csv
│   ├── resumes\_dataset.jsonl
│   ├── labelled\_resumes\_clean.csv
│   └── skills\_dictionary.json
│
├── models/
│   ├── category\_classifier.joblib
│   ├── classifier\_metrics.json
│   ├── benchmark\_results.csv
│   └── confusion\_matrix.png
│
├── src/
│   ├── api/
│   │   └── main.py
│   │
│   ├── extraction/
│   │   └── text\_extractor.py
│   │
│   ├── preprocessing/
│   │   └── text\_cleaner.py
│   │
│   ├── skills/
│   │   ├── skill\_extractor.py
│   │   └── build\_skills\_dictionary.py
│   │
│   ├── matching/
│   │   ├── tfidf\_matcher.py
│   │   ├── doc2vec\_matcher.py
│   │   ├── embedding\_matcher.py
│   │   └── benchmark.py
│   │
│   ├── classification/
│   │   ├── prepare\_dataset.py
│   │   ├── train\_classifier.py
│   │   └── explainability.py
│   │
│   └── services/
│       └── analyze.py
│
├── frontend/
│
├── tests/
│
├── make\_confusion\_matrix.py
├── run\_shap\_anonymized.py
├── requirements.txt
├── PROJECT\_PLAN.md
├── README.md
└── .gitignore
\`\`\`

\---

\## Setup

\### Prerequisites

\- Python 3.10+
\- Node.js
\- pnpm
\- Tesseract OCR
\- Poppler

\### Windows PowerShell

Clone or open the repository and create the Python virtual environment:

\`\`\`powershell
cd RESUMEIQ

python -m venv venv

.\venv\Scripts\activate

pip install -r requirements.txt
\`\`\`

Optional spaCy model:

\`\`\`powershell
python -m spacy download en\_core\_web\_sm
\`\`\`

Tesseract OCR and Poppler must be installed separately because they are system-level dependencies.

\---

\## Running the Application

ResumeIQ consists of a FastAPI backend and React frontend.

\### Terminal 1 — FastAPI Backend

\`\`\`powershell
cd RESUMEIQ

.\venv\Scripts\activate

python -m uvicorn src.api.main\:app --reload --host 127.0.0.1 --port 8000
\`\`\`

The API will be available at:

\`\`\`text
[http://127.0.0.1:8000](http://127.0.0.1:8000)
\`\`\`

\### Terminal 2 — React Frontend

\`\`\`powershell
cd RESUMEIQ\frontend

pnpm install

pnpm dev
\`\`\`

The frontend will be available at:

\`\`\`text
[http://127.0.0.1:5173](http://127.0.0.1:5173)
\`\`\`

Then use:

\`\`\`text
Register
   ↓
Login
   ↓
Dashboard
   ↓
Select Job Role
   ↓
Upload Resume
   ↓
Analyse Resume
   ↓
View Results
\`\`\`

\---

\## Training the Classifier

The final classifier can be reproduced using:

\`\`\`powershell
.\venv\Scripts\activate

python -m src.classification.train\_classifier
\`\`\`

The training process:

1\. Loads the prepared resume dataset
2\. Splits the data into training and test sets
3\. Generates TF-IDF features
4\. Applies SMOTE to the training data
5\. Trains Logistic Regression
6\. Evaluates the classifier on the untouched test set
7\. Generates classification metrics
8\. Saves the trained pipeline

The trained model is saved to:

\`\`\`text
models/category\_classifier.joblib
\`\`\`

\---

\## Evaluation

\### Classification Evaluation

The final classifier was evaluated using:

\- Accuracy
\- Macro Precision
\- Macro Recall
\- Macro F1
\- Per-class precision
\- Per-class recall
\- Per-class F1
\- Confusion matrix

The final evaluation was performed on \*\*661 unseen test samples\*\* across \*\*36 categories\*\*.

\### Final Classification Results

\`\`\`text
Accuracy          : 90.17%
Macro Precision   : 93.53%
Macro Recall      : 93.27%
Macro F1          : 93.27%
\`\`\`

The confusion matrix is available at:

\`\`\`text
models/confusion\_matrix.png
\`\`\`

![Classification Confusion Matrix]\(models/confusion\_matrix.png)

\### Retrieval Evaluation

The TF-IDF retrieval benchmark was evaluated using:

\`\`\`text
MRR        : 0.76
Precision\@5: 0.84
\`\`\`

using 128 sampled resumes against 324 job roles.

\---

\## Testing

The project contains automated tests under:

\`\`\`text
tests/
\`\`\`

Run the tests using:

\`\`\`powershell
pytest
\`\`\`

Additional manual system testing covers:

\- User registration
\- User login
\- Authentication
\- Resume upload
\- Invalid file handling
\- PDF text extraction
\- OCR fallback
\- Skill extraction
\- Job-role matching
\- Category prediction
\- Career-readiness analysis
\- SHAP explanation
\- Analysis history
\- JSON persistence

\---

\## Security and Privacy Considerations

ResumeIQ is developed as a dissertation prototype.

The system includes several basic security measures:

\- Passwords are not stored in plaintext
\- Authentication is required for protected analysis functionality
\- User analysis records are associated with authenticated users
\- User JSON files are excluded from version control
\- Temporary uploaded resume files are processed locally

For production deployment, additional measures would be recommended, including:

\- HTTPS
\- Secure token management
\- Production-grade password hashing such as Argon2id or bcrypt
\- Database-backed persistence
\- Rate limiting
\- Secure secret management
\- Stronger file validation
\- Centralized logging and monitoring

\---

\## Limitations

The current implementation has several prototype-level limitations:

\- JSON files are used instead of a production database.
\- Authentication tokens are maintained in application memory.
\- The system is designed primarily for a single-instance deployment.
\- Doc2Vec and sentence-transformer approaches are implemented as additional experimental matching approaches and are not part of the primary validated matching pipeline.
\- The quality of skill extraction depends on the available skill taxonomy and resume text quality.
\- OCR performance depends on document quality and installed OCR dependencies.

\---

\## Future Improvements

Potential future improvements include:

\- Migration from JSON persistence to PostgreSQL/MySQL
\- Production-grade authentication and authorization
\- Improved semantic matching using transformer embeddings
\- Larger and more diverse resume datasets
\- Improved skill ontology and skill normalization
\- Multi-language resume support
\- Cloud deployment
\- Job-market trend integration
\- Continuous model retraining
\- Advanced career-path recommendations

\---

\## Implementation Status

\| Component | Status |
\|---|---|
\| Resume text extraction | Completed |
\| PDF/DOCX support | Completed |
\| OCR fallback | Completed |
\| Text preprocessing | Completed |
\| Skill extraction | Completed |
\| Skill taxonomy | Completed |
\| TF-IDF matching | Completed |
\| Job-role matching | Completed |
\| Logistic Regression classification | Completed |
\| SMOTE class balancing | Completed |
\| SHAP explainability | Implemented |
\| FastAPI backend | Completed |
\| React frontend | Completed |
\| Authentication | Completed |
\| Analysis history | Completed |
\| JSON persistence | Completed |
\| Classification evaluation | Completed |
\| Confusion matrix | Completed |
\| Automated testing | Completed |
\| Streamlit interface | Legacy prototype |

\---

\## Dissertation Context

ResumeIQ was developed as a BSc (Hons) Data Science dissertation project under module \*\*CIS6001\*\*.

The project investigates how natural language processing, information retrieval, machine learning classification, class balancing and model explainability can be combined to support automated resume-to-job matching and career-readiness analysis.

The final system integrates these components into a working web application consisting of a React frontend and FastAPI backend.
