from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import city, report

app = FastAPI(
    title="SatEye API", 
    description="Electronic Health Record & Environmental Satellite Intelligence"
)

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach routes
app.include_router(city.router)
app.include_router(report.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "SatEye API running"}

if __name__ == "__main__":
    import uvicorn
    from database import initialize_spatial_db
    
    # Force PostGIS & Schema initialization
    initialize_spatial_db()
    
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)