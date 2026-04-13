from pydantic import BaseModel
from typing import Optional, Dict

class Agent(BaseModel):
    name: str
    description: Optional[str] = None
    type: str

    dataSource: Optional[Dict] = None
    privacyMode: Optional[str] = None
    encryption: Optional[bool] = True
    proofGeneration: Optional[bool] = True

    status: Optional[str] = "inactive"