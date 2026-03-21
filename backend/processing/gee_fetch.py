import ee
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from google.oauth2 import service_account

# Load environment variables
load_dotenv()

# Resolve the path to gee_key.json relative to this file
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_KEY_PATH = os.path.join(_BASE_DIR, "..", "gee_key.json")

def initialize_gee():
    """Initializes Google Earth Engine using the service account key file."""
    try:
        key_path = os.getenv("GEE_KEY_PATH", _KEY_PATH)
        key_path = os.path.abspath(key_path)

        with open(key_path, "r") as f:
            key_data = json.load(f)

        project_id = key_data.get("project_id", "prem-487710")
        client_email = key_data.get("client_email")

        credentials = service_account.Credentials.from_service_account_info(
            key_data,
            scopes=["https://www.googleapis.com/auth/earthengine"]
        )

        ee.Initialize(credentials=credentials, project=project_id)
        print(f"✅ GEE Authenticated as {client_email} on project [{project_id}]")
        return True

    except FileNotFoundError:
        print(f"⚠️  gee_key.json not found at {_KEY_PATH}. GEE disabled.")
        return False
    except Exception as e:
        print(f"⚠️  GEE Initialization failed: {e}")
        return False

import requests

def get_city_geometry(city_name):
    """
    Returns a dynamic GEE geometry for ANY city name using Nominatim Geocoding.
    """
    try:
        # Use Nominatim for free geocoding (be mindful of rate limits)
        url = f"https://nominatim.openstreetmap.org/search?q={city_name}&format=json&limit=1"
        headers = {'User-Agent': 'SatEye-Env-Intelligence-App'}
        response = requests.get(url, headers=headers, timeout=10)
        data = response.json()
        
        if data:
            lat = float(data[0]["lat"])
            lon = float(data[0]["lon"])
            # Return a buffer around the city point (15km)
            return ee.Geometry.Point([lon, lat]).buffer(15000)
        else:
            # Fallback to Ahmedabad if not found
            print(f"WARNING: City '{city_name}' not found. Falling back to Ahmedabad.")
            return ee.Geometry.Point([72.5714, 23.0225]).buffer(15000)
    except Exception as e:
        print(f"ERROR in geocoding: {e}")
        return ee.Geometry.Point([72.5714, 23.0225]).buffer(15000)

def fetch_lst_data(city_name, start_date, end_date):
    """Pulls Land Surface Temperature (LST) from MODIS."""
    geom = get_city_geometry(city_name)
    modis = ee.ImageCollection("MODIS/061/MOD11A1") \
              .filterBounds(geom) \
              .filterDate(start_date, end_date) \
              .select('LST_Day_1km')
    
    mean_lst = modis.mean().multiply(0.02).subtract(273.15).clip(geom)
    return mean_lst

def fetch_ndvi_data(city_name, start_date, end_date):
    """Pulls NDVI (Vegetation) from Sentinel-2."""
    geom = get_city_geometry(city_name)
    s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED") \
           .filterBounds(geom) \
           .filterDate(start_date, end_date) \
           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
    
    def calculate_ndvi(image):
        return image.normalizedDifference(['B8', 'B4']).rename('NDVI')
    
    mean_ndvi = s2.map(calculate_ndvi).mean().clip(geom)
    return mean_ndvi

def fetch_no2_data(city_name, start_date, end_date):
    """Pulls Nitrogen Dioxide (NO2) from Sentinel-5P."""
    geom = get_city_geometry(city_name)
    s5p = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_NO2") \
            .filterBounds(geom) \
            .filterDate(start_date, end_date) \
            .select('NO2_column_number_density')
    
    mean_no2 = s5p.mean().clip(geom)
    return mean_no2

def get_image_mean(image, geom):
    """
    Extracts the mean value of an image over a geometry.
    Returns the value as a float.
    """
    try:
        stats = image.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=geom,
            scale=1000,
            maxPixels=1e9
        ).getInfo()
        
        # Get the first value in the dictionary
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
        last_month = today - timedelta(days=30)
        
        start = last_month.strftime('%Y-%m-%d')
        end = today.strftime('%Y-%m-%d')
        
        print(f"Fetching data for {city} from {start} to {end}...")
        # Note: This is a placeholder for actual execution in a production environment
        # as it requires GEE access.
