from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()  # Load .env before anything else

from routes import city, report, copilot

from database import initialize_spatial_db

app = FastAPI(
    title="SatEye API", 
    description="Electronic Health Record & Environmental Satellite Intelligence"
)

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    initialize_spatial_db()

# Attach routes
app.include_router(city.router)
app.include_router(report.router)
app.include_router(copilot.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "SatEye API running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)