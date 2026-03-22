import ee
import os
import json
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
from google.oauth2 import service_account

load_dotenv()

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_KEY_PATH  = os.path.join(_BASE_DIR, "..", "gee_key.json")

# ── In-process geocode cache: city_name → (lat, lon) ──────────────────────
_GEOCODE_CACHE: dict = {}

def initialize_gee():
    """Initializes Google Earth Engine using the service account key file."""
    try:
        key_path = os.path.abspath(os.getenv("GEE_KEY_PATH", _KEY_PATH))
        with open(key_path, "r") as f:
            key_data = json.load(f)

        project_id   = key_data.get("project_id", "prem-487710")
        client_email = key_data.get("client_email")

        credentials = service_account.Credentials.from_service_account_info(
            key_data, scopes=["https://www.googleapis.com/auth/earthengine"]
        )
        ee.Initialize(credentials=credentials, project=project_id)
        print(f"GEE Authenticated as {client_email} on project [{project_id}]")
        return True
    except FileNotFoundError:
        print(f"WARNING: gee_key.json not found at {_KEY_PATH}. GEE disabled.")
        return False
    except Exception as e:
        print(f"WARNING: GEE Initialization failed: {e}")
        return False


# ── KNOWN CITY COORDINATES (lat, lon) ─────────────────────────────────────
# Hard-coded fallback coordinates for common Indian cities.
# This prevents silent fallback to Ahmedabad when Nominatim fails.
_CITY_COORDS: dict = {
    "ahmedabad":   (23.0225, 72.5714),
    "gandhinagar": (23.2156, 72.6369),
    "surat":       (21.1702, 72.8311),
    "vadodara":    (22.3072, 73.1812),
    "rajkot":      (22.3039, 70.8022),
    "mumbai":      (19.0760, 72.8777),
    "pune":        (18.5204, 73.8567),
    "delhi":       (28.6139, 77.2090),
    "bangalore":   (12.9716, 77.5946),
    "bengaluru":   (12.9716, 77.5946),
    "chennai":     (13.0827, 80.2707),
    "hyderabad":   (17.3850, 78.4867),
    "kolkata":     (22.5726, 88.3639),
    "jaipur":      (26.9124, 75.7873),
    "lucknow":     (26.8467, 80.9462),
    "bhopal":      (23.2599, 77.4126),
    "nagpur":      (21.1458, 79.0882),
    "indore":      (22.7196, 75.8577),
    "patna":       (25.5941, 85.1376),
}


def geocode_city(city_name: str) -> tuple[float, float]:
    """
    Returns (lat, lon) for a city name.
    Priority: (1) in-process cache, (2) known coords table, (3) Nominatim API.
    Raises ValueError if the city cannot be resolved — never silently falls
    back to Ahmedabad coordinates.
    """
    key = city_name.strip().lower()

    # 1. In-process cache
    if key in _GEOCODE_CACHE:
        return _GEOCODE_CACHE[key]

    # 2. Known coords
    if key in _CITY_COORDS:
        coords = _CITY_COORDS[key]
        _GEOCODE_CACHE[key] = coords
        return coords

    # 3. Nominatim — with a country bias to India for better accuracy
    try:
        url = (
            f"https://nominatim.openstreetmap.org/search"
            f"?q={city_name}&format=json&limit=3&countrycodes=in"
        )
        headers = {"User-Agent": "GeoSense-Env-Intelligence/1.0"}
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()

        if data:
            # Prefer results whose display_name contains "India" and is a city-level
            chosen = None
            for entry in data:
                disp = entry.get("display_name", "").lower()
                otype = entry.get("type", "")
                if "india" in disp and otype in ("city", "administrative", "town"):
                    chosen = entry
                    break
            if chosen is None:
                chosen = data[0]   # best-effort first result

            lat = float(chosen["lat"])
            lon = float(chosen["lon"])
            coords = (lat, lon)
            _GEOCODE_CACHE[key] = coords
            print(f"Geocoded '{city_name}' → lat={lat:.4f}, lon={lon:.4f} [{chosen.get('display_name', '')}]")
            return coords

        raise ValueError(f"Nominatim returned no results for city '{city_name}'.")

    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Geocoding failed for '{city_name}': {e}")


def get_city_geometry(city_name: str) -> "ee.Geometry":
    """
    Returns a GEE Geometry (15 km buffer around city centre).
    Uses the hardened geocode_city() — never silently defaults to Ahmedabad.
    """
    lat, lon = geocode_city(city_name)
    return ee.Geometry.Point([lon, lat]).buffer(15000)


def fetch_lst_data(city_name, start_date, end_date):
    """Pulls Land Surface Temperature (LST) from MODIS."""
    geom = get_city_geometry(city_name)
    modis = (
        ee.ImageCollection("MODIS/061/MOD11A1")
        .filterBounds(geom)
        .filterDate(start_date, end_date)
        .select("LST_Day_1km")
    )
    return modis.mean().multiply(0.02).subtract(273.15).clip(geom)


def fetch_ndvi_data(city_name, start_date, end_date):
    """Pulls NDVI (Vegetation) from Sentinel-2."""
    geom = get_city_geometry(city_name)
    s2 = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(geom)
        .filterDate(start_date, end_date)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
    )

    def calculate_ndvi(image):
        return image.normalizedDifference(["B8", "B4"]).rename("NDVI")

    return s2.map(calculate_ndvi).mean().clip(geom)


def fetch_no2_data(city_name, start_date, end_date):
    """Pulls Nitrogen Dioxide (NO2) from Sentinel-5P."""
    geom = get_city_geometry(city_name)
    s5p = (
        ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_NO2")
        .filterBounds(geom)
        .filterDate(start_date, end_date)
        .select("NO2_column_number_density")
    )
    return s5p.mean().clip(geom)


def get_image_mean(image, geom) -> float:
    """Extracts the mean value of a single-band image over a geometry."""
    try:
        stats = image.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=geom,
            scale=1000,
            maxPixels=1e9,
        ).getInfo()
        if stats:
            val = list(stats.values())[0]
            return float(val) if val is not None else 0.0
        return 0.0
    except Exception as e:
        print(f"Error extracting GEE stats: {e}")
        return 0.0


if __name__ == "__main__":
    if initialize_gee():
        city = "Ahmedabad"
        today = datetime.now()
        start = (today - timedelta(days=30)).strftime("%Y-%m-%d")
        end   = today.strftime("%Y-%m-%d")
        print(f"Fetching data for {city} from {start} to {end}...")
        lat, lon = geocode_city(city)
        print(f"City coordinates: lat={lat}, lon={lon}")
