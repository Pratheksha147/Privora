Privora — Privacy-Preserving AI Agent Platform

Analyze datasets securely using local AI. No cloud. No data exposure. Full privacy.


Overview
Privora is a privacy-first AI agent platform that enables secure, explainable, and verifiable dataset analysis — entirely on your local machine. Built with a LangGraph multi-agent pipeline and powered by Ollama + Llama3, Privora ensures your sensitive data never leaves your system.
Users upload datasets in CSV, Excel, JSON, or PDF formats. The system automatically runs them through a 4-agent AI pipeline that understands the data, detects sensitive fields, generates insights, and produces a cryptographic proof of execution.

Features

Multi-Agent AI Pipeline — LangGraph-orchestrated agents for data analysis, privacy detection, insight generation, and proof creation
Local LLM Processing — Powered by Ollama + Llama3; zero external API calls, zero data exposure
Privacy Detection — Automatically identifies PII fields (email, phone, Aadhaar, SSN, etc.)
Cryptographic Proof Generation — SHA-256 hash per execution creates an immutable audit trail
Privacy Badge System — Visual verification status per execution (Verified / Pending / Failed)
Audit Trail — Full execution history with timestamps and proof hashes
Downloadable Reports — Export results as PDF, CSV, or JSON
Analytics Dashboard — Visual overview of agent performance and execution stats
Supported Formats — CSV, Excel (XLSX), JSON, PDF


Agent Pipeline
User Upload → Data Agent → Privacy Agent → Insight Agent → Proof Agent → Dashboard → Reports
AgentResponsibilityData AgentParses dataset structure, extracts rows, columns, statistics, and sample dataPrivacy AgentDetects sensitive fields and calculates privacy risk levelInsight AgentUses local LLM to identify dataset type, trends, and key findingsProof AgentGenerates SHA-256 hash proof and creates audit log entry

Tech Stack
Frontend

React, TypeScript, Tailwind CSS, Vite
Recharts (analytics), Lucide Icons

Backend

FastAPI, Python, Pandas, NumPy, Pydantic

AI & Agents

LangGraph, LangChain
Ollama + Llama3 (local LLM)

Database

MongoDB, PyMongo

Reporting

ReportLab (PDF), JSON export, CSV export


Getting Started
Prerequisites

Python 3.10+
Node.js 18+
MongoDB running locally
Ollama installed with Llama3 pulled

bashollama pull llama3
Backend Setup
bashcd backend
pip install -r requirements.txt
uvicorn main:app --reload
Frontend Setup
bashcd frontend
npm install
npm run dev
Environment Variables
Create a .env file in the backend directory:
envMONGO_URI=mongodb://localhost:27017
DATABASE_NAME=privora
OLLAMA_MODEL=llama3

How It Works

Upload a dataset (CSV, Excel, JSON, or PDF) through the dashboard
Data Agent extracts structure, column names, data types, statistics, and sample rows
Privacy Agent scans column names against known PII keywords and flags sensitive fields
Insight Agent sends sanitized data to the local LLM, which identifies the dataset type and generates concrete, number-backed insights
Proof Agent serializes the full result and generates a SHA-256 hash as cryptographic proof
Dashboard displays dataset type, key insights, privacy risk level, proof badge, and full audit trail
Export results as PDF, CSV, or JSON


Why Privora?
Traditional AI analytics platforms send your data to external cloud APIs. Privora does not.
PrivoraTraditional PlatformsData leaves your machineNeverYesLLM processingLocal (Ollama)Cloud APIProof of executionCryptographic hashNonePII detectionBuilt-inManualAudit trailImmutable, per-runVaries
Privora is built for use cases where data privacy is non-negotiable — healthcare records, financial data, government datasets, and enterprise analytics.

Use Cases

Secure analysis of medical or patient records
Privacy-preserving financial and payroll data insights
Government and compliance dataset processing
Research dataset intelligence without cloud dependency
Enterprise data analytics with full audit trail


Project Structure
Privora_1/
├── backend/
│   ├── app/
│   ├── downloads/
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   ├── requirements.txt
│   └── run.py
├── Privora/                  (frontend)
│   ├── public/
│   ├── src/
│   ├── components.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
└── README.md


License
MIT License — feel free to use, modify, and distribute.


Built with a focus on privacy, explainability, and real-world data security.
