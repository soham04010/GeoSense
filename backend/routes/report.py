from fastapi import APIRouter

router = APIRouter()

@router.post("/api/report/generate")
def generate_report():
    """
    TODO: Integrate ReportLab here.
    For now, return a success message so frontend can test the button click.
    """
    return {"status": "success", "message": "PDF generation triggered. File will be ready soon."}