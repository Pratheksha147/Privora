from fastapi import APIRouter, UploadFile, File
from app.database.mongodb import db
from app.models.agent import Agent
from bson import ObjectId
from datetime import datetime
from fastapi.responses import FileResponse
import pandas as pd
import os
import json

from app.agents.langgraph_agent import run_langgraph

router = APIRouter(prefix="/agents", tags=["Agents"])


# Create Agent
@router.post("/create")
def create_agent(agent: Agent):

    agent_data = agent.dict()

    agent_data["status"] = "paused"
    agent_data["executions"] = 0
    agent_data["created"] = datetime.utcnow()

    result = db.agents.insert_one(agent_data)

    return {
        "message": "Agent created successfully",
        "id": str(result.inserted_id)
    }


# Get All Agents
@router.get("/")
def get_agents():

    agents = list(db.agents.find())

    for agent in agents:
        agent["_id"] = str(agent["_id"])

    return agents


# Get Single Agent
@router.get("/{agent_id}")
def get_agent(agent_id: str):

    agent = db.agents.find_one({"_id": ObjectId(agent_id)})

    if not agent:
        return {"message": "Agent not found"}

    agent["_id"] = str(agent["_id"])

    return agent


# Execute Agent
@router.post("/execute/{agent_id}")
async def execute_agent(agent_id: str, file: UploadFile = File(...)):

    agent = db.agents.find_one({"_id": ObjectId(agent_id)})

    if not agent:
        return {"message": "Agent not found"}

    start_time = datetime.now()

    # Save Uploaded File
    os.makedirs("uploads", exist_ok=True)

    file_location = f"uploads/{file.filename}"

    with open(file_location, "wb") as f:
        f.write(await file.read())

    # Detect File Type
    file_extension = file.filename.split(".")[-1].lower()

    # Read File
    if file_extension == "csv":
        df = pd.read_csv(file_location)

    elif file_extension in ["xls", "xlsx"]:
        df = pd.read_excel(file_location, engine="openpyxl")

    elif file_extension == "json":
        df = pd.read_json(file_location)

    elif file_extension == "pdf":
        import pdfplumber

        data = []
        with pdfplumber.open(file_location) as pdf:
            for page in pdf.pages:
                table = page.extract_table()
                if table:
                    data.extend(table)

        df = pd.DataFrame(data)
        df.columns = df.columns.astype(str)

    else:
        return {"message": "Unsupported file format"}

    # Run LangGraph Agent
    langgraph_result = run_langgraph(df)

    summary = langgraph_result["summary"]
    privacy = langgraph_result["privacy"]
    insights = langgraph_result["insights"]
    proof = langgraph_result["proof"]
    proof_status = langgraph_result["proofStatus"]

    end_time = datetime.now()

    duration = str(round((end_time - start_time).total_seconds(), 2)) + "s"

    execution = {
        "agent_id": agent_id,
        "agent_name": agent["name"],
        "result": {
            "summary": summary,
            "privacy": privacy,
            "insights": insights
        },
        "proof": proof,
        "status": "completed",
        "proofStatus": proof_status,
        "started": start_time,
        "completed": end_time,
        "duration": duration,
        "rowsProcessed": len(df),
        "timestamp": datetime.now()
    }

    db.executions.insert_one(execution)

    db.agents.update_one(
        {"_id": ObjectId(agent_id)},
        {
            "$set": {
                "status": "completed",
                "lastRun": datetime.now()
            },
            "$inc": {
                "executions": 1
            }
        }
    )

    return {
        "message": "Agent executed successfully",
        "result": {
            "summary": summary,
            "privacy": privacy,
            "insights": insights
        },
        "proof": proof
    }


@router.get("/executions/{agent_id}")
def get_executions(agent_id: str):

    executions = list(db.executions.find({"agent_id": agent_id}))

    for execution in executions:
        execution["id"] = str(execution["_id"])
        del execution["_id"]

    return executions


@router.get("/privacy/{agent_id}")
def get_privacy_status(agent_id: str):

    execution = db.executions.find_one(
        {"agent_id": agent_id},
        sort=[("timestamp", -1)]
    )

    if not execution:
        return {"status": "No executions"}

    return {
        "agent_id": agent_id,
        "status": execution["status"],
        "proof": execution["proof"],
        "proofStatus": execution["proofStatus"],
        "timestamp": execution["timestamp"]
    }


@router.get("/analytics/dashboard")
def analytics_dashboard():

    executions = list(db.executions.find())

    if len(executions) == 0:
        return {
            "rows": 0,
            "processedTime": "0s",
            "confidence": "0%",
            "data": []
        }

    latest = executions[-1]

    result = latest.get("result", {})
    summary = result.get("summary", {})

    columns = summary.get("column_names", [])
    rows = summary.get("rows", 0)

    chart_data = []

    for col in columns:
        chart_data.append({
            "name": col,
            "count": rows // len(columns) if len(columns) > 0 else 0,
            "percentage": round(100 / len(columns), 2) if len(columns) > 0 else 0,
            "trend": "stable",
            "change": 0
        })

    return {
        "agent_id": latest.get("agent_id"),
        "rows": rows,
        "processedTime": latest.get("duration", "0s"),
        "confidence": "100%" if result.get("privacy", {}).get("privacy_risk") == "low" else "85%",
        "data": chart_data,
        "privacy": result.get("privacy", {}),
        "insights": result.get("insights", "")
    }


@router.get("/download/{agent_id}/{format}")
def download_result(agent_id: str, format: str):

    execution = db.executions.find_one(
        {"agent_id": agent_id},
        sort=[("timestamp", -1)]
    )

    if not execution:
        return {"error": "No execution found"}

    result = execution.get("result", {})

    os.makedirs("downloads", exist_ok=True)

    # JSON
    if format == "json":

        file_path = f"downloads/{agent_id}.json"

        with open(file_path, "w") as f:
            json.dump(result, f, indent=2)

        return FileResponse(file_path, filename="result.json")

    # CSV
    elif format == "csv":

        df = pd.DataFrame([result])

        file_path = f"downloads/{agent_id}.csv"

        df.to_csv(file_path, index=False)

        return FileResponse(file_path, filename="result.csv")

    # PDF
    
    elif format == "pdf":

     from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.units import inch

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        alignment=TA_CENTER,
        textColor=colors.HexColor("#2563eb")
    )

    header_style = styles['Heading2']
    normal = styles['BodyText']

    file_path = f"downloads/{agent_id}.pdf"

    doc = SimpleDocTemplate(file_path, pagesize=A4)

    story = []

    # Title
    story.append(Paragraph("Privora Privacy Analysis Report", title_style))
    story.append(Spacer(1, 12))

    # Safe Data Extraction
    summary = result.get("summary", {}) or {}
    privacy = result.get("privacy", {}) or {}
    insights = result.get("insights", "") or ""

    # Dataset Summary
    story.append(Paragraph("Dataset Summary", header_style))
    story.append(Spacer(1, 8))

    summary_data = [
        ["Metric", "Value"],
        ["Rows", str(summary.get("rows", 0))],
        ["Columns", str(summary.get("columns", 0))],
        ["Column Names", ", ".join(map(str, summary.get("column_names", [])))],
        ["Missing Values", str(summary.get("missing_values", {}))]
    ]

    summary_table = Table(summary_data, colWidths=[2.5 * inch, 3.5 * inch])

    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2563eb")),
        ('TEXTCOLOR',(0,0),(-1,0),colors.white),
        ('GRID',(0,0),(-1,-1),1,colors.grey),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BACKGROUND',(0,1),(-1,-1),colors.whitesmoke),
    ]))

    story.append(summary_table)
    story.append(Spacer(1, 20))

    # Privacy Section
    story.append(Paragraph("Privacy Analysis", header_style))
    story.append(Spacer(1, 8))

    sensitive_fields = privacy.get("sensitive_fields", []) or []

    privacy_data = [
        ["Metric", "Value"],
        ["Sensitive Fields", ", ".join(map(str, sensitive_fields)) or "None"],
        ["Privacy Risk", str(privacy.get("privacy_risk", "Low")).upper()]
    ]

    privacy_table = Table(privacy_data, colWidths=[2.5 * inch, 3.5 * inch])

    privacy_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#16a34a")),
        ('TEXTCOLOR',(0,0),(-1,0),colors.white),
        ('GRID',(0,0),(-1,-1),1,colors.grey),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BACKGROUND',(0,1),(-1,-1),colors.whitesmoke),
    ]))

    story.append(privacy_table)
    story.append(Spacer(1, 20))

    # Insights Section
    story.append(Paragraph("AI Insights", header_style))
    story.append(Spacer(1, 8))

    formatted_insights = str(insights).replace("\n", "<br/>")

    story.append(Paragraph(formatted_insights, normal))
    story.append(Spacer(1, 20))

    # Footer
    story.append(Paragraph(
        "Generated by Privora - Privacy Preserving AI Agents",
        styles['Italic']
    ))

    doc.build(story)

    return FileResponse(file_path, filename="Privora_Report.pdf")