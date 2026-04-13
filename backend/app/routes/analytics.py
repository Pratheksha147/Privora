from fastapi import APIRouter
from app.database.mongodb import db

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
def dashboard_stats():

    total_agents = db.agents.count_documents({})
    total_executions = db.executions.count_documents({})
    verified = db.executions.count_documents({"status": "verified"})
    failed = db.executions.count_documents({"status": "failed"})

    return {
        "total_agents": total_agents,
        "total_executions": total_executions,
        "verified": verified,
        "failed": failed
    }


