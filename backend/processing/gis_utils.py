import folium
import json
import os

from processing.gee_fetch import get_city_geometry

def create_folium_map(city_name):
    """Generates a dynamic Folium map for ANY city using geocoded geometry."""
    try:
        import requests
        url = f"https://nominatim.openstreetmap.org/search?q={city_name}&format=json&limit=1"
        headers = {'User-Agent': 'SatEye-App'}
        response = requests.get(url, headers=headers, timeout=5)
        data = response.json()
        if data:
            center = [float(data[0]["lat"]), float(data[0]["lon"])]
        else:
            center = [23.0225, 72.5714]
    except:
        center = [23.0225, 72.5714]

    m = folium.Map(location=center, zoom_start=12, tiles='cartodbpositron')
    
    # Generate dynamic 6x6 grid for Folium map if it's not Ahmedabad
    if city_name.lower() == "ahmedabad":
        title = "Ahmedabad Wards"
        # Path for Ahmedabad static data
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "data"))
        geojson_path = os.path.join(DATA_DIR, "ahmedabad_wards.geojson")
        if os.path.exists(geojson_path):
            with open(geojson_path, "r") as f:
                geojson_data = json.load(f)
        else: geojson_data = None
    else:
        title = f"{city_name} Jurisdictional Grid"
        # Generate dynamic GeoJSON grid (simplified for Folium)
        offset = 0.012
        features = []
        for i in range(36):
            row, col = i // 6, i % 6
            lat_min = center[0] + (row - 3) * offset
            lat_max = lat_min + offset
            lng_min = center[1] + (col - 3) * offset
            lng_max = lng_min + offset
            features.append({
                "type": "Feature",
                "properties": {"ward_name": f"{city_name} Sector {i+1}"},
                "geometry": {"type": "Polygon", "coordinates": [[[lng_min, lat_min], [lng_max, lat_min], [lng_max, lat_max], [lng_min, lat_max], [lng_min, lat_min]]]}
            })
        geojson_data = {"type": "FeatureCollection", "features": features}

    if geojson_data:
        def style_function(feature):
            return {'fillColor': '#10b981', 'color': 'white', 'weight': 1, 'fillOpacity': 0.4}

        folium.GeoJson(
            geojson_data,
            name=title,
            style_function=style_function,
            tooltip=folium.GeoJsonTooltip(fields=['ward_name'], aliases=['Sector: '])
        ).add_to(m)
        
    folium.LayerControl().add_to(m)
    return m

def get_map_html(m):
    """Returns the HTML representation of a Folium map."""
    return m._repr_html_()

def save_map_to_html(m, filepath):
    """Saves a Folium map to an HTML file."""
    m.save(filepath)
