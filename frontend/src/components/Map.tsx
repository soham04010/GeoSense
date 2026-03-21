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

    const { ward: name, lst, ndvi, pm25 } = ward;
    layer.bindPopup(`
      <div class="glass-popup p-4 min-w-[200px] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md bg-slate-900/40 text-white">
        <div class="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 class="font-black text-xs uppercase tracking-widest">${name}</h3>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between items-center group">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Surface Temp</span>
            <span class="text-sm font-black text-emerald-400 flex items-center gap-1">${lst}°C <span class="text-[8px] opacity-40">LST</span></span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Veg Health</span>
            <span class="text-sm font-black text-sky-400">${ndvi} <span class="text-[8px] opacity-40">NDVI</span></span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Air Quality</span>
            <span class="text-sm font-black text-orange-400">${pm25} <span class="text-[8px] opacity-40">µG/M³</span></span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-white/5 flex gap-2">
           <div class="px-2 py-0.5 rounded-full bg-slate-800 text-[8px] font-black uppercase tracking-tighter text-slate-500">ML ANALYZED</div>
           <div class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[8px] font-black uppercase tracking-tighter text-emerald-500">OPTIMAL</div>
        </div>
      </div>
    `, {
      className: 'custom-leaflet-popup',
      maxWidth: 300
    });
  };

  if (!geoData) return <div className="h-[500px] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 animate-pulse text-slate-500">Loading geospatial layers...</div>;

  return (
    <div className="h-[500px] w-full relative group">
      <MapContainer key={geoData?.city || 'default'} center={center} zoom={12} className="h-full w-full rounded-xl z-0 shadow-2xl border border-slate-800">
        <ChangeView center={center} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
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