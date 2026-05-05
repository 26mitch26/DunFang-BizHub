from fastapi import APIRouter, UploadFile, File, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.invoice_service import InvoiceService
from services.business_agent import BusinessAgent

router = APIRouter()
invoice_service = InvoiceService()
business_agent = BusinessAgent()


class AgentRequest(BaseModel):
    question: str
    context: dict = {}


@router.post("/parse-invoice")
async def parse_invoice(
    file: UploadFile = File(...),
    x_dashscope_api_key: Optional[str] = Header(None)
):
    if not x_dashscope_api_key:
        raise HTTPException(status_code=400, detail="Missing X-DashScope-Api-Key header")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    image_bytes = await file.read()

    try:
        result = invoice_service.parse_invoice(image_bytes, x_dashscope_api_key)
        return {
            "code": 200,
            "message": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/agent/chat")
async def agent_chat(
    req: AgentRequest,
    x_dashscope_api_key: Optional[str] = Header(None)
):
    if not x_dashscope_api_key:
        raise HTTPException(status_code=400, detail="Missing X-DashScope-Api-Key header")

    try:
        answer = business_agent.analyze(req.question, req.context, x_dashscope_api_key)
        return {
            "code": 200,
            "message": "success",
            "data": {"answer": answer}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
