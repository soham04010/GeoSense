import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """Opens a connection to the Supabase PostgreSQL database."""
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"CRITICAL: Database connection failed: {e}")
        return None

def initialize_spatial_db():
    conn = get_db_connection()
    if not conn: return
    try:
        cur = conn.cursor()
        cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS gee_data_cache (
                id SERIAL PRIMARY KEY,
                city_name VARCHAR(100),
                parameter VARCHAR(50),
                value FLOAT,
                timestamp TIMESTAMP DEFAULT NOW()
            );
        """)
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

def cache_gee_value(city, parameter, value):
    conn = get_db_connection()
    if not conn: return
    try:
        cur = conn.cursor()
        cur.execute("INSERT INTO gee_data_cache (city_name, parameter, value) VALUES (%s, %s, %s)", (city, parameter, value))
        conn.commit()
        cur.close()
        conn.close()
    except: pass

def get_cached_gee_value(city, parameter, hours=24):
    conn = get_db_connection()
    if not conn: return None
    try:
        cur = conn.cursor()
        cur.execute("SELECT value FROM gee_data_cache WHERE city_name=%s AND parameter=%s AND timestamp > NOW() - INTERVAL '%s hours' ORDER BY timestamp DESC LIMIT 1", (city, parameter, hours))
        row = cur.fetchone()
        cur.close()
        conn.close()
        return row['value'] if row else None
    except: return None