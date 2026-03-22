import requests
import os

WAQI_TOKEN = os.getenv("WAQI_TOKEN", "demo")

# US EPA AQI breakpoints for PM2.5 (µg/m³)
# https://www.airnow.gov/aqi/aqi-basics/
_PM25_BREAKPOINTS = [
    (0.0,   12.0,   0,   50),
    (12.1,  35.4,  51,  100),
    (35.5,  55.4, 101,  150),
    (55.5, 150.4, 151,  200),
    (150.5, 250.4, 201, 300),
    (250.5, 350.4, 301, 400),
    (350.5, 500.4, 401, 500),
]


def pm25_to_aqi(pm25: float) -> int:
    """
    Converts a PM2.5 concentration (µg/m³) to AQI using the standard
    US EPA linear interpolation formula. Much more accurate than * 1.5.
    """
    if pm25 < 0:
        return 0
    for c_lo, c_hi, i_lo, i_hi in _PM25_BREAKPOINTS:
        if c_lo <= pm25 <= c_hi:
            aqi = ((i_hi - i_lo) / (c_hi - c_lo)) * (pm25 - c_lo) + i_lo
            return round(aqi)
    # Beyond the table: very hazardous
    return 500


def get_live_pollution(city: str, lat: float = None, lng: float = None):
    """
    Fetches real-time PM2.5 and AQI data from WAQI.

    Strategy:
    1. If coordinates are provided, use the geo-lookup endpoint (most accurate).
    2. Otherwise, search by city name and pick the station whose name most
       closely matches the requested city (avoids taking a random nearby station).

    Returns a dict with city, pm25, aqi, station, source  — or None on failure.
    """
    if WAQI_TOKEN == "demo":
        print(
            "WARNING: WAQI_TOKEN is 'demo'. Add a real token to .env as WAQI_TOKEN=<your_key> "
            "for accurate, non-rate-limited data. Register free at https://aqicn.org/api/"
        )

    try:
        feed_data = None

        # ── Strategy 1: coordinate-based geo lookup ────────────────────
        if lat is not None and lng is not None:
            url = f"https://api.waqi.info/feed/geo:{lat};{lng}/?token={WAQI_TOKEN}"
            resp = requests.get(url, timeout=10).json()
            if resp.get("status") == "ok":
                feed_data = resp["data"]
                # Sanity check: verify the station is reasonably close
                station_geo = feed_data.get("city", {}).get("geo", [])
                if station_geo and len(station_geo) == 2:
                    s_lat, s_lon = float(station_geo[0]), float(station_geo[1])
                    distance_deg = ((s_lat - lat) ** 2 + (s_lon - lng) ** 2) ** 0.5
                    if distance_deg > 1.5:   # more than ~150 km off
                        print(
                            f"WARNING: WAQI geo-station '{feed_data.get('city', {}).get('name')}' "
                            f"is {distance_deg:.2f}° away from {city}. Trying name search instead."
                        )
                        feed_data = None   # fall through to name search

        # ── Strategy 2: city-name search, closest-matching station ─────
        if feed_data is None:
            search_url = f"https://api.waqi.info/search/?token={WAQI_TOKEN}&keyword={city}"
            s_resp = requests.get(search_url, timeout=10).json()
            if s_resp.get("status") == "ok" and s_resp.get("data"):
                stations = s_resp["data"]
                city_lower = city.lower()
                # Prefer stations whose name contains the city name
                matched = [
                    s for s in stations
                    if city_lower in s.get("station", {}).get("name", "").lower()
                ]
                best = matched[0] if matched else stations[0]
                uid = best["uid"]
                feed_resp = requests.get(
                    f"https://api.waqi.info/feed/@{uid}/?token={WAQI_TOKEN}", timeout=10
                ).json()
                if feed_resp.get("status") == "ok":
                    feed_data = feed_resp["data"]

        # ── Parse the feed ─────────────────────────────────────────────
        if feed_data:
            iaqi  = feed_data.get("iaqi", {})
            pm25  = iaqi.get("pm25", {}).get("v")
            raw_aqi = feed_data.get("aqi")

            # Use standard AQI formula — not the rough * 1.5 estimate
            if pm25 is not None:
                computed_aqi = pm25_to_aqi(float(pm25))
            elif raw_aqi:
                # AQI reported but no PM2.5 breakdown — back-derive PM2.5 estimate
                pm25 = float(raw_aqi) * 0.6   # rough inverse
                computed_aqi = int(raw_aqi)
            else:
                pm25        = None
                computed_aqi = None

            station_name = feed_data.get("city", {}).get("name", "Unknown")
            return {
                "city":    city,
                "pm25":    round(float(pm25), 1) if pm25 else None,
                "aqi":     computed_aqi,
                "station": station_name,
                "source":  "WAQI Real-time (Ground Station)",
            }

        return None

    except Exception as e:
        print(f"WAQI Error for '{city}': {e}")
        return None


if __name__ == "__main__":
    test_city = "Ahmedabad"
    print(f"Fetching live stats for {test_city}...")
    result = get_live_pollution(test_city, lat=23.0225, lng=72.5714)
    if result:
        print(f"Success! PM2.5: {result['pm25']} | AQI: {result['aqi']} | Station: {result['station']}")
    else:
        print("Failed to fetch live data.")
