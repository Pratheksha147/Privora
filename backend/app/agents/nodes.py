from typing import Dict, Any
import pandas as pd


# Data Analysis Node
def data_agent(state: Dict[str, Any]):

    df = state["dataframe"]

    # numeric statistics
    numeric_stats = {}
    if not df.select_dtypes(include='number').empty:
        numeric_stats = df.describe().round(2).to_dict()

    # sample rows
    sample_rows = df.head(5).to_dict(orient="records")

    summary = {
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": list(df.columns),
        "missing_values": df.isnull().sum().to_dict(),
        "data_types": df.dtypes.astype(str).to_dict(),
        "numeric_stats": numeric_stats,
        "sample_rows": sample_rows
    }

    state["summary"] = summary
    state["dataframe"] = df

    return state


# Privacy Detection Node
def privacy_agent(state):

    summary = state["summary"]
    columns = summary["column_names"]

    sensitive_fields = []

    keywords = [
        "email",
        "phone",
        "mobile",
        "name",
        "address",
        "aadhaar",
        "ssn",
        "credit",
        "card",
        "password"
    ]

    for col in columns:
        for key in keywords:
            if key.lower() in col.lower():
                sensitive_fields.append(col)

    state["privacy"] = {
        "sensitive_fields": sensitive_fields,
        "privacy_risk": "high" if len(sensitive_fields) > 0 else "low"
    }

    return state


# Insight Agent
import ollama


def insight_agent(state):

    summary = state["summary"]
    sensitive_fields = state.get("privacy", {}).get("sensitive_fields", [])

    clean_sample = []
    for row in summary.get("sample_rows", []):
        clean_sample.append({
            k: v for k, v in row.items()
            if k not in sensitive_fields
        })

    clean_stats = {
        col: stats for col, stats in summary.get("numeric_stats", {}).items()
        if col not in sensitive_fields
    }

    prompt = f"""
You are a professional data analyst.

Analyze the dataset and provide clean insights.

Output format:

What the data is about:
Explain what dataset represents

Key Insights:
- Insight 1
- Insight 2
- Insight 3

Data Quality:
Explain dataset quality

Dataset Info:
Rows: {summary["rows"]}
Columns: {summary["columns"]}
Column Names: {summary["column_names"]}
Missing Values: {summary["missing_values"]}

Numeric Statistics:
{clean_stats}

Sample Data:
{clean_sample}

IMPORTANT RULES:
- Do NOT return JSON
- Do NOT use markdown (** or ###)
- Do NOT use curly braces
- Return clean readable text only
"""

    response = ollama.chat(
        model="llama3",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    # Clean markdown automatically
    text = response["message"]["content"]

    text = text.replace("**", "")
    text = text.replace("###", "")
    text = text.replace("```", "")

    dataset_type = ""
    key_insights = ""
    data_quality = ""

    sections = text.split("\n")

    current = None

    for line in sections:

        if "What the data is about" in line:
            current = "dataset"
            continue

        elif "Key Insights" in line:
            current = "insights"
            continue

        elif "Data Quality" in line:
            current = "quality"
            continue

        if current == "dataset":
            dataset_type += line + " "

        elif current == "insights":
            key_insights += line + "\n"

        elif current == "quality":
            data_quality += line + " "

    state["insights"] = {
        "dataset_type": dataset_type.strip(),
        "key_insights": key_insights.strip(),
        "data_quality": data_quality.strip()
    }

    return state


import hashlib
import json


# Proof Agent
def proof_agent(state):

    result = {
        "summary": state["summary"],
        "privacy": state["privacy"],
        "insights": state["insights"]
    }

    proof = hashlib.sha256(
        json.dumps(result).encode()
    ).hexdigest()

    state["proof"] = proof
    state["proofStatus"] = "verified"

    return state