from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from processing.ml_analysis import generate_pdf
import os

router = APIRouter()

@router.post("/api/report/generate/{city_name}")
def download_action_plan(city_name: str):
    """
    Triggers your friend's ML script to generate the PDF and sends it to the user.
    """
    try:
        # 1. Run your friend's function (assumes it saves a PDF and returns the file path)
        pdf_file_path = generate_pdf(city_name)
        
        # 2. Check if the file was actually created
        if not os.path.exists(pdf_file_path):
            raise HTTPException(status_code=500, detail="PDF generation failed.")
            
        # 3. Send the file back to the Next.js frontend to trigger the download
        return FileResponse(
            path=pdf_file_path, 
            media_type="application/pdf", 
            filename=f"{city_name}_SatEye_Action_Plan.pdf"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))