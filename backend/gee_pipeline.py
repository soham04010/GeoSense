import ee
import pandas as pd
import joblib 
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from google.oauth2 import service_account
from sqlalchemy import create_engine
import os

ee.Authenticate() 

# Replace this with the project ID you just created in Step 1!
ee.Initialize(project='jeevrak')

# 1. Load Environment Variables
load_dotenv()

print("Authenticating Earth Engine using Service Account JSON file...")
try:
    # Get the file path from .env
    key_path = os.environ.get("GEE_KEY_PATH", "gee_key.json")
    
    # Open and read the JSON file directly
    with open(key_path, 'r') as f:
        creds_dict = json.load(f)
    
    # Generate Google Cloud credentials
    credentials = service_account.Credentials.from_service_account_info(
        creds_dict,
        scopes=['https://www.googleapis.com/auth/earthengine']
    )
    
    # Initialize Earth Engine
    ee.Initialize(credentials, project=creds_dict.get("project_id"))
    print("✅ Earth Engine Authenticated Successfully via Service Account!")
    
except Exception as e:
    print(f"⚠️ Service Account Auth Failed: {e}")
    # Fallback to local auth with the specific project ID
    print("Attempting local fallback...")
    ee.Initialize(project='prem-487710')

# 2. Define your multiple cities... (Keep the rest of your code exactly the same below here)

# 2. Define your multiple cities (Center coordinates & Buffer radius in meters)
# Since your ML model supports multiple cities, we store them in a dictionary.
cities = {
    "Ahmedabad": {"coords": [72.5714, 23.0225], "radius": 15000},
    "Surat": {"coords": [72.8311, 21.1702], "radius": 12000},
    "Delhi": {"coords": [77.2090, 28.6139], "radius": 20000}
}

# 3. Load your pre-trained Machine Learning model
# (Assuming your friend saved it as a .pkl file)
# trained_model = joblib.load('models/multi_city_anomaly_model.pkl')

def fetch_city_data(city_name, city_info):
    """Fetches the last 30 days of temperature data for a specific city."""
    print(f"Fetching satellite data for {city_name}...")
    
    # Create a geographic boundary for the city
    point = ee.Geometry.Point(city_info["coords"])
    region = point.buffer(city_info["radius"])
    
    # Set date range (e.g., last 30 days)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    # Pull MODIS Land Surface Temperature (LST) dataset
    dataset = ee.ImageCollection('MODIS/061/MOD11A1') \
        .filterBounds(region) \
        .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')) \
        .select('LST_Day_1km') \
        .mean() # Get the average temperature over the last 30 days
        
    # Sample the pixels inside the city boundary
    # This turns the map image into raw numbers
    samples = dataset.sample(
        region=region,
        scale=1000, # 1km resolution
        numPixels=100 # Grab 100 random data points across the city
    )
    
    # THE CRITICAL STEP: .getInfo() moves data from Google Cloud to your laptop
    data_dict = samples.getInfo()
    
    # Format into a list of dictionaries for Pandas
    features = data_dict.get('features', [])
    clean_data = []
    
    for f in features:
        props = f.get('properties', {})
        if 'LST_Day_1km' in props:
            # MODIS stores temp in Kelvin with a 0.02 scale factor. Convert to Celsius.
            temp_celsius = (props['LST_Day_1km'] * 0.02) - 273.15
            clean_data.append({
                "city": city_name,
                "lst_celsius": round(temp_celsius, 2)
            })
            
    return pd.DataFrame(clean_data)

# 4. Execute the pipeline for all cities
all_cities_data = pd.DataFrame()

for city, info in cities.items():
    city_df = fetch_city_data(city, info)
    all_cities_data = pd.concat([all_cities_data, city_df], ignore_index=True)

print("\n--- Raw Data Extracted from Space ---")
print(all_cities_data.head())

# 5. Feed the Multi-City Data into your ML Model
print("\n--- Running ML Anomaly Detection ---")

# Assuming your model expects a DataFrame with 'lst_celsius'
# X = all_cities_data[['lst_celsius']]
# all_cities_data['anomaly_flag'] = trained_model.predict(X)

# FAKING THE PREDICTION FOR THE EXAMPLE (Remove this when using your real model):
# Change the number to 25.0
all_cities_data['anomaly_flag'] = all_cities_data['lst_celsius'].apply(lambda x: -1 if x > 25.0 else 1)

# Filter out only the critical anomalies
anomalies = all_cities_data[all_cities_data['anomaly_flag'] == -1]

print(f"Found {len(anomalies)} heat anomalies across all cities.")
print(anomalies.head())

# 6. Next Step: Push this 'anomalies' DataFrame to your Supabase PostgreSQL database!
print(f"Found {len(anomalies)} heat anomalies across all cities.")
print(anomalies.head())

# --- THE FINAL BRIDGE: SAVING TO SUPABASE ---
print("\n--- Pushing Data to Supabase ---")
try:
    # 1. Get your Database URL from the .env file
    # Note: SQLAlchemy requires 'postgresql://' instead of 'postgres://' 
    # but your .env string already uses 'postgresql://' which is perfect!
    db_url = os.environ.get("DATABASE_URL")
    
    # 2. Create the connection engine
    engine = create_engine(db_url)
    
    # 3. Clean up the DataFrame to match your database columns
    # Assuming your database has a simple 'anomalies' table
    if not anomalies.empty:
        # Let's add a timestamp so we know when this happened
        anomalies['detected_at'] = datetime.now()
        anomalies['severity'] = 'CRITICAL'
        anomalies['parameter'] = 'LST'
        anomalies['reason'] = 'Temperature exceeded safe threshold'
        
        # We only want to push specific columns
        cols_to_push = anomalies[['city', 'parameter', 'severity', 'reason', 'detected_at']]
        
        # 4. Push directly to Supabase!
        # if_exists='append' means it will add new rows without deleting old ones
        # CHANGE 'append' TO 'replace'
        cols_to_push.to_sql('anomalies', engine, if_exists='replace', index=False)
        print("✅ Anomalies successfully saved to Supabase!")
    else:
        print("ℹ️ No anomalies to push today.")
        
except Exception as e:
    print(f"⚠️ Failed to push to database: {e}")