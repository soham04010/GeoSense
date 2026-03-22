from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
try:
    from backend.processing.ml_analysis import generate_pdf
    from backend.processing.sector_report import generate_sector_pdf
except ImportError:
    from processing.ml_analysis import generate_pdf
    from processing.sector_report import generate_sector_pdf

router = APIRouter()

class SectorReportRequest(BaseModel):
    city: str
    ward: str
    lat: float
    lng: float
    bbox: list[float]
    aqi: float
    lst: float
    ndvi: float

@router.post("/api/report/sector")
def download_sector_plan(payload: SectorReportRequest):
    """
    Downloads precise sector analysis PDF with satellite imagery.
    """
    try:
        result = generate_sector_pdf(payload.dict())
        if result["status"] == "error":
            raise Exception(result["message"])
            
        pdf_file_path = result["file_path"]
        if not os.path.exists(pdf_file_path):
            raise HTTPException(status_code=500, detail="PDF generation failed.")
            
        # Format the file name
        safe_ward = "".join([c if c.isalnum() else "_" for c in payload.ward])
        
        return FileResponse(
            path=pdf_file_path, 
            media_type="application/pdf", 
            filename=f"{safe_ward}_Analysis.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/report/generate")
def download_action_plan(city: str = Query(..., description="The city to generate report for")):
    """
    Triggers ML script to generate the PDF and sends it to the user.
    """
    try:
        # 1. Run ML generation function
        result = generate_pdf(city)
        
        if result["status"] == "error":
            raise Exception(result["message"])
            
        pdf_file_path = result["file_path"]
        
        # 2. Check if the file was actually created
        if not os.path.exists(pdf_file_path):
            raise HTTPException(status_code=500, detail="PDF generation failed.")
            
        # 3. Send the file back
        return FileResponse(
            path=pdf_file_path, 
            media_type="application/pdf", 
            filename=f"{city}_SatEye_Action_Plan.pdf"
        )
        
    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR in download_action_plan: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))