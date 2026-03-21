from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from processing.ml_analysis import generate_pdf
import os

router = APIRouter()

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
        raise HTTPException(status_code=500, detail=str(e))