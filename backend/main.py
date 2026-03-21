from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import city, report

app = FastAPI(title="SatEye API", description="Backend for Satellite Environmental Intelligence")

# 1. Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Lets Next.js talk to this API
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Attach your routes
app.include_router(city.router)
app.include_router(report.router)

# 3. Simple health check route
@app.get("/")
def health_check():
    return {"status": "SatEye API is LIVE and ready for the hackathon."}