import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icon issues in Next.js
if (typeof window !== 'undefined') {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function aqiLabel(aqi: number): { text: string; color: string } {
  if (aqi <= 50)  return { text: 'Good',        color: '#22c55e' };
  if (aqi <= 100) return { text: 'Moderate',     color: '#facc15' };
  if (aqi <= 150) return { text: 'Unhealthy (S)',color: '#f97316' };
  if (aqi <= 200) return { text: 'Unhealthy',    color: '#ef4444' };
  if (aqi <= 300) return { text: 'Very Unhealthy',color: '#9b1c9b' };
  return           { text: 'Hazardous',          color: '#7f1d1d' };
}

export default function SatEyeMap({ geoData, activeLayer = 'lst', onWardClick }: { geoData: any, activeLayer?: 'lst' | 'ndvi' | 'pm25', onWardClick?: (ward: any) => void }) {
  const center: [number, number] = geoData?.center || [23.0225, 72.5714];

  const getColor = (value: number, layer: string) => {
    if (layer === 'lst') {
      return value > 44 ? '#ef4444' :
             value > 42 ? '#f97316' :
             value > 40 ? '#facc15' :
             value > 38 ? '#22c55e' :
                         '#10b981';
    } else if (layer === 'ndvi') {
      return value > 0.4 ? '#059669' :
             value > 0.3 ? '#10b981' :
             value > 0.2 ? '#34d399' :
             value > 0.1 ? '#a7f3d0' :
                         '#ecfdf5';
    } else { // pm25
      return value > 45 ? '#b91c1c' :
             value > 40 ? '#ef4444' :
             value > 35 ? '#f97316' :
             value > 30 ? '#facc15' :
                         '#22c55e';
    }
  };

  const onEachWard = (ward: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.85, weight: 2, color: 'white' });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.5, weight: 1, color: 'rgba(255,255,255,0.3)' });
      },
      click: () => {
        if (onWardClick) onWardClick(ward);
      }
    });

    const { ward: name, lst, ndvi, pm25, pm10, no2, so2, ozone, aqi } = ward;
    const aqiInfo = aqiLabel(aqi || Math.round((pm25 || 55) * 1.5));
    const aqiVal  = aqi || Math.round((pm25 || 55) * 1.5);

    layer.bindPopup(`
      <div style="font-family:'Inter',sans-serif;min-width:240px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.8);">
        <!-- Header -->
        <div style="padding:14px 16px 10px;border-bottom:1px solid rgba(255,255,255,0.07);">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <div style="width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 6px #10b981;animation:pulse 2s infinite;"></div>
            <p style="font-size:9px;color:#64748b;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;margin:0;">Live Sector Intelligence</p>
          </div>
          <h3 style="font-size:13px;font-weight:900;color:#f1f5f9;letter-spacing:-0.02em;margin:0;text-transform:uppercase;">${name}</h3>
        </div>

        <!-- AQI Banner -->
        <div style="padding:12px 16px;background:${aqiInfo.color}18;border-bottom:1px solid rgba(255,255,255,0.05);">
          <p style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Air Quality Index</p>
          <div style="display:flex;align-items:baseline;gap:8px;">
            <span style="font-size:32px;font-weight:900;color:${aqiInfo.color};line-height:1;">${aqiVal}</span>
            <span style="font-size:11px;font-weight:800;color:${aqiInfo.color};padding:2px 8px;border-radius:99px;background:${aqiInfo.color}20;border:1px solid ${aqiInfo.color}40;">${aqiInfo.text}</span>
          </div>
        </div>

        <!-- Pollutants Grid -->
        <div style="padding:12px 16px;display:grid;grid-template-columns:1fr 1fr;gap:8px;border-bottom:1px solid rgba(255,255,255,0.05);">
          <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:8px 10px;">
            <p style="font-size:8px;color:#64748b;font-weight:700;text-transform:uppercase;margin:0 0 3px;">PM₂.₅</p>
            <p style="font-size:16px;font-weight:900;color:#f97316;margin:0;">${pm25} <span style="font-size:9px;color:#64748b;">µg/m³</span></p>
          </div>
          <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:8px 10px;">
            <p style="font-size:8px;color:#64748b;font-weight:700;text-transform:uppercase;margin:0 0 3px;">PM₁₀</p>
            <p style="font-size:16px;font-weight:900;color:#fb923c;margin:0;">${pm10} <span style="font-size:9px;color:#64748b;">µg/m³</span></p>
          </div>
          <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:8px 10px;">
            <p style="font-size:8px;color:#64748b;font-weight:700;text-transform:uppercase;margin:0 0 3px;">NO₂</p>
            <p style="font-size:16px;font-weight:900;color:#a78bfa;margin:0;">${no2} <span style="font-size:9px;color:#64748b;">ppb</span></p>
          </div>
          <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:8px 10px;">
            <p style="font-size:8px;color:#64748b;font-weight:700;text-transform:uppercase;margin:0 0 3px;">SO₂</p>
            <p style="font-size:16px;font-weight:900;color:#38bdf8;margin:0;">${so2} <span style="font-size:9px;color:#64748b;">ppb</span></p>
          </div>
          <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:8px 10px;">
            <p style="font-size:8px;color:#64748b;font-weight:700;text-transform:uppercase;margin:0 0 3px;">Ozone</p>
            <p style="font-size:16px;font-weight:900;color:#34d399;margin:0;">${ozone} <span style="font-size:9px;color:#64748b;">ppb</span></p>
          </div>
          <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:8px 10px;">
            <p style="font-size:8px;color:#64748b;font-weight:700;text-transform:uppercase;margin:0 0 3px;">Surface Temp</p>
            <p style="font-size:16px;font-weight:900;color:#ef4444;margin:0;">${lst}° <span style="font-size:9px;color:#64748b;">LST</span></p>
          </div>
        </div>

        <!-- NDVI Footer -->
        <div style="padding:10px 16px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <p style="font-size:8px;color:#64748b;font-weight:700;text-transform:uppercase;margin:0 0 2px;">Vegetation (NDVI)</p>
            <p style="font-size:14px;font-weight:900;color:#10b981;margin:0;">${ndvi} <span style="font-size:9px;color:#64748b;">index</span></p>
          </div>
          <div style="display:flex;gap:4px;">
            <span style="padding:3px 8px;border-radius:99px;background:#1e293b;font-size:8px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">ML Analyzed</span>
            <span style="padding:3px 8px;border-radius:99px;background:#10b98120;border:1px solid #10b98140;font-size:8px;font-weight:800;color:#10b981;text-transform:uppercase;letter-spacing:0.1em;">CSV Data</span>
          </div>
        </div>
      </div>
    `, {
      className: 'custom-leaflet-popup dark-popup',
      maxWidth: 320
    });
  };

  if (!geoData) return <div className="h-[500px] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 animate-pulse text-slate-500">Loading geospatial layers...</div>;

  return (
    <div className="h-[500px] w-full relative group">
      <MapContainer key={geoData?.city || 'default'} center={center} zoom={12} className="h-full w-full rounded-xl z-0 shadow-2xl border border-slate-800">
        <ChangeView center={center} />
        {/* Satellite base layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com">Esri</a>, Maxar, GeoEye, Earthstar Geographics'
        />
        {/* Transparent labels overlay on top of satellite */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution=""
          opacity={0.7}
        />
        {geoData.wards && geoData.wards.map((ward: any, idx: number) => (
          <GeoJSON 
            key={`${ward.ward}-${idx}`}
            data={ward.geometry} 
            style={() => ({
              fillColor: getColor(ward[activeLayer], activeLayer),
              weight: 1,
              opacity: 1,
              color: 'rgba(255,255,255,0.3)',
              fillOpacity: 0.5
            })}
            onEachFeature={(_, layer) => onEachWard(ward, layer)}
          />
        ))}
      </MapContainer>
      <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 z-[400] text-[10px] font-bold text-white shadow-2xl min-w-[180px]">
        <div className="flex items-center gap-2 mb-4 opacity-70">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
           <p className="uppercase tracking-[0.2em] font-black text-[9px]">
             {activeLayer === 'lst' ? 'Heat Intensity' : activeLayer === 'ndvi' ? 'Vegetation Index' : 'Pollutant Density'}
           </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center gap-4">
             <div className="flex gap-2 items-center">
                <span className={`w-3 h-1.5 rounded-full ${activeLayer === 'ndvi' ? 'bg-[#ecfdf5]' : activeLayer === 'pm25' ? 'bg-[#22c55e]' : 'bg-[#10b981]'}`}></span>
                <span className="opacity-50 uppercase tracking-tighter">{activeLayer === 'lst' ? 'Low Heat' : activeLayer === 'ndvi' ? 'Low Veg' : 'Good AQI'}</span>
             </div>
             <span className="font-black text-[9px]">{activeLayer === 'lst' ? '<38°' : activeLayer === 'ndvi' ? '0.1' : '15'}</span>
          </div>
          
          <div className="flex justify-between items-center gap-4">
             <div className="flex gap-2 items-center">
                <span className={`w-3 h-1.5 rounded-full ${activeLayer === 'ndvi' ? 'bg-[#34d399]' : activeLayer === 'pm25' ? 'bg-[#facc15]' : 'bg-[#facc15]'}`}></span>
                <span className="opacity-50 uppercase tracking-tighter">{activeLayer === 'lst' ? 'Moderate' : activeLayer === 'ndvi' ? 'Medium' : 'Moderate'}</span>
             </div>
             <span className="font-black text-[9px]">{activeLayer === 'lst' ? '41°' : activeLayer === 'ndvi' ? '0.2' : '30'}</span>
          </div>

          <div className="flex justify-between items-center gap-4">
             <div className="flex gap-2 items-center">
                <span className={`w-3 h-1.5 rounded-full ${activeLayer === 'ndvi' ? 'bg-[#059669]' : activeLayer === 'pm25' ? 'bg-[#b91c1c]' : 'bg-[#ef4444]'}`}></span>
                <span className="opacity-50 uppercase tracking-tighter">{activeLayer === 'lst' ? 'Extreme' : activeLayer === 'ndvi' ? 'Dense Green' : 'Critical'}</span>
             </div>
             <span className="font-black text-[9px]">{activeLayer === 'lst' ? '>44°' : activeLayer === 'ndvi' ? '0.4+' : '45+'}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5">
           <div className="flex justify-between items-center opacity-40 italic">
              <span>LIVE FEED</span>
              <span>100% SYNC</span>
           </div>
        </div>
      </div>
    </div>
  );
}