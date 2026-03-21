"use client";

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  geoJsonData: any; // The data fetched from your FastAPI backend
}

export default function Map({ geoJsonData }: MapProps) {
  // Center of Ahmedabad
  const position: [number, number] = [23.0225, 72.5714];

  // Function to color the wards based on temperature
  const style = (feature: any) => {
    const temp = feature.properties.lst_celsius;
    return {
      fillColor: temp > 45 ? '#ef4444' : temp > 40 ? '#f97316' : '#22c55e',
      weight: 2,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };

  return (
    <MapContainer center={position} zoom={11} style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}>
      {/* The base street map */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {/* The spatial data from your PostGIS database */}
      {geoJsonData && (
        <GeoJSON 
          data={geoJsonData} 
          style={style}
          onEachFeature={(feature, layer) => {
            layer.bindPopup(`<b>${feature.properties.ward_name}</b><br>Temp: ${feature.properties.lst_celsius}°C`);
          }}
        />
      )}
    </MapContainer>
  );
}