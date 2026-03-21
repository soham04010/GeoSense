from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Optional
import os

router = APIRouter()

class CopilotRequest(BaseModel):
    message: str
    context: Optional[dict[str, Any]] = {}

def _build_system_prompt(city: str, context: dict) -> str:
    """Build a rich system prompt from the city's environmental context."""
    
    summary = context.get("summary", {})
    anomalies = context.get("anomalies", {})
    
    all_pollutants = summary.get("all_pollutants", {})
    alerts = anomalies.get("alerts", [])
    risks = summary.get("risks", {})
    
    alerts_text = "\n".join(
        f"  - [{a.get('level','?')}] {a.get('parameter','?')}: {a.get('message','')}"
        for a in alerts
    ) if alerts else "  - No critical anomalies detected."

    risks_text = "\n".join(
        f"  - {k.upper()}: {v.get('level','?')} — {v.get('message','')}"
        for k, v in risks.items()
    ) if risks else "  - No risk data available."

    return f"""You are GeoSense Copilot, an expert AI environmental analyst built into the GeoSense Smart City Intelligence Platform.
You specialize in analyzing satellite and sensor data for urban environmental monitoring.

Your personality: concise, data-driven, actionable. Never verbose. Use bullet points when listing findings.
Always respond in the context of {city}'s specific data provided below.

--- LIVE CITY DATA FOR {city.upper()} ---

POLLUTANTS & SATELLITE METRICS:
  - PM2.5:          {all_pollutants.get('PM2.5', 'N/A')} µg/m³
  - PM10:           estimated ~{round(float(all_pollutants.get('PM2.5') or 55) * 1.6, 1)} µg/m³
  - AQI:            {all_pollutants.get('AQI', 'N/A')}
  - NO2:            {all_pollutants.get('NO2', 'N/A')} ppb
  - SO2:            {all_pollutants.get('SO2', 'N/A')} ppb
  - Ozone:          {all_pollutants.get('Ozone', 'N/A')} ppb
  - LST (Surface Temp): {all_pollutants.get('LST', 'N/A')} °C
  - NDVI (Vegetation): {all_pollutants.get('NDVI', 'N/A')}
  - Soil Moisture:  {all_pollutants.get('Soil Moisture', 'N/A')}%

CLIMATE TRENDS:
  - Observed warming since baseline: +{summary.get('warming', 'N/A')} °C
  - Predicted average temp by 2050:  {summary.get('predicted_2050', 'N/A')} °C

ACTIVE RISK FLAGS:
{risks_text}

ACTIVE ANOMALY ALERTS:
{alerts_text}

DATA SOURCE: {summary.get('source', 'Local Environmental Dataset')}
--- END OF CITY DATA ---

Answer the user's question concisely using ONLY the data above. If you can't find specific data, say so honestly. 
Do not make up numbers. Keep answers under 150 words unless explicitly asked for detail.
When summarising, lead with the most critical finding first."""


@router.post("/api/city/{city}/copilot")
async def city_copilot(city: str, body: CopilotRequest):
    """
    AI Copilot endpoint — answers questions about a city's environmental data.
    Uses Groq GPT-OSS-120B model.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY not configured. Add it to your .env file."
        )

    try:
        from groq import Groq
        client = Groq(api_key=groq_api_key)

        system_prompt = _build_system_prompt(city, body.context)

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": body.message},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.4,
            max_tokens=400,
        )

        reply = chat_completion.choices[0].message.content
        return {"reply": reply, "city": city}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot error: {str(e)}")
