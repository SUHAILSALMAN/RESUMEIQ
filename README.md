# ResumeIQ — AI-Powered Resume Skill Match & Career Readiness Analysis

ResumeIQ is a BSc (Hons) Data Science dissertation project (CIS6001) that provides candidate-facing resume analysis and career-readiness feedback.

The system analyses an uploaded CV against a selected job role, identifies relevant and missing skills, calculates resume-to-job similarity, predicts a job category using a trained machine-learning classifier, and provides explainable feedback.

## Key Features

- Resume upload using PDF or DOCX files
- PDF/DOCX text extraction with OCR fallback for scanned PDFs
- NLP-based resume preprocessing
- Skill extraction from resume text
- Job-role and required-skill matching
- TF-IDF lexical similarity
- Embedding-based similarity using available Doc2Vec/Sentence-Transformer components
- Skill-gap identification
- Job-category prediction using Logistic Regression
- SMOTE-based class balancing during classifier training
- SHAP-based explainability
- Candidate dashboard
- User registration and login
- Previous analysis history

## System Architecture

The system consists of:

1. React/Vite frontend
2. FastAPI backend
3. NLP and machine-learning analysis pipeline
4. Local data and model storage

Uploaded resumes are processed through a temporary file during analysis. User account information and analysis history are stored using the project's local JSON persistence.

## Machine Learning Pipeline

The resume classification pipeline follows:

Resume Dataset
→ Text Preprocessing
→ Train/Test Split
→ TF-IDF Vectorisation
→ SMOTE
→ Logistic Regression
→ Evaluation
→ Saved Model

The trained classifier is saved as:

`models/category_classifier.joblib`

The classifier is used to predict the most likely resume/job category.

## Resume-to-Job Matching

Resume matching combines lexical and semantic approaches.

### TF-IDF

TF-IDF provides the lexical similarity baseline between resume text and job-role descriptions.

### Embedding-based Matching

The project also contains Doc2Vec and Sentence-Transformer based matching components where the required dependencies and models are available.

### Skill-Gap Analysis

The system compares extracted candidate skills against the required skills for the selected job role.

For example:

Required:
- Python
- SQL
- Power BI
- Tableau

Candidate:
- Python
- SQL
- Power BI

Result:
- Matched: Python, SQL, Power BI
- Missing: Tableau

## Explainable AI

SHAP is used to provide explanations for the job-category classifier by identifying terms/features contributing to the prediction.

This helps make the classification output more understandable rather than presenting only the predicted category.

## Dataset

The project uses a labelled resume dataset for classification and a separate job-role dataset for resume-to-job matching.

The project currently contains:

- Approximately 3,500 labelled resumes across 36 resume categories
- 324 job roles
- 764 unique skills derived from the job-role data

The raw resume data is cleaned and transformed before model training.

## Model Performance

The final classifier achieved:

- Accuracy: **90.2%**
- Macro-F1: **93.3%**

The evaluation methodology and detailed results are documented in the dissertation.

The TF-IDF retrieval benchmark achieved:

- MRR: **0.76**
- Precision@5: **0.84**

## Data Processing

The preprocessing pipeline addresses issues identified in the source resume data, including repeated boilerplate content.

Skills are extracted from resume text rather than relying directly on the unreliable raw `Skills` field.

## Installation

### Windows PowerShell

```powershell
cd D:\Suhail\resume_readiness_system
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
