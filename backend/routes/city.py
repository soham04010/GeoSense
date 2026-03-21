from fastapi import APIRouter, HTTPException
from database import get_db_connection
import json

router = APIRouter()

@router.get("/api/city/{city}/heatmap")
def get_heatmap(city: str):
    """Returns ward boundaries and the latest temperature for the map."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB Connection Failed")
    
    try:
        cursor = conn.cursor()
        # Grab the ward shape (as GeoJSON) and the latest LST reading
        query = """
            SELECT 
                w.ward_id,
                w.ward_name, 
                o.lst_celsius,
                ST_AsGeoJSON(w.geom)::json AS geometry
            FROM wards w
            LEFT JOIN lst_observations o ON w.ward_id = o.ward_id
            WHERE o.date = (SELECT MAX(date) FROM lst_observations)
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        # Format perfectly for React-Leaflet
        features = []
        for row in rows:
            features.append({
                "type": "Feature",
                "properties": {
                    "ward_id": row["ward_id"],
                    "ward_name": row["ward_name"],
                    "lst_celsius": row["lst_celsius"]
                },
                "geometry": row["geometry"]
            })
            
        return {"type": "FeatureCollection", "features": features}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            cursor.close()
            conn.close()

@router.get("/api/city/{city}/anomalies")
def get_anomalies(city: str):
    """Returns the latest ML-detected anomalies for the alert cards."""
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="DB Connection Failed")
        
    try:
        cursor = conn.cursor()
        query = """
            SELECT a.parameter, a.severity, a.reason, w.ward_name, a.detected_at
            FROM anomalies a
            JOIN wards w ON a.ward_id = w.ward_id
            ORDER BY a.detected_at DESC
            LIMIT 10
        """
        cursor.execute(query)
        return cursor.fetchall() # RealDictCursor makes this instantly JSON ready
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            cursor.close()
            conn.close()