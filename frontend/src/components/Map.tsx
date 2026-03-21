import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
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
    map.flyTo(center, map.getZoom(), { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function SatEyeMap({ geoData, activeLayer = 'lst', onWardClick }: { geoData: any, activeLayer?: 'lst' | 'ndvi' | 'pm25', onWardClick?: (ward: any) => void }) {
  const center: [number, number] = geoData?.center || [23.0225, 72.5714];

  // Colors match aqi.in exactly: Green -> Yellow -> Orange -> Red -> Purple -> Dark Red
  const getColorAndSize = (value: number, layer: string) => {
    if (layer === 'lst') { // Temperature
      if (value > 44) return { color: '#7f1d1d', radius: 24 }; // extreme
      if (value > 42) return { color: '#dc2626', radius: 20 }; // very high
      if (value > 40) return { color: '#f97316', radius: 16 }; // high
      if (value > 38) return { color: '#facc15', radius: 12 }; // moderate
      return { color: '#22c55e', radius: 8 }; // good
    } else if (layer === 'ndvi') { // Vegetation (reversed logic: low is bad/red)
      if (value < 0.1) return { color: '#ef4444', radius: 20 }; // critical barren
      if (value < 0.2) return { color: '#f97316', radius: 16 }; // warning
      if (value < 0.3) return { color: '#facc15', radius: 12 }; // moderate
      if (value < 0.4) return { color: '#84cc16', radius: 10 }; // good
      return { color: '#22c55e', radius: 8 }; // excellent green
    } else { // pm25 / AQI equivalent
      if (value > 45) return { color: '#9f1239', radius: 24 }; // severe
      if (value > 40) return { color: '#dc2626', radius: 20 }; // poor
      if (value > 35) return { color: '#f97316', radius: 16 }; // moderate-to-poor
      if (value > 30) return { color: '#facc15', radius: 12 }; // moderate
      return { color: '#22c55e', radius: 10 }; // good
    }
  };

  if (!geoData) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 border border-slate-200 animate-pulse text-slate-500 font-bold uppercase tracking-widest text-xs">
        Loading Map Markers...
      </div>
    );
  }

  return (
    <div className="h-full w-full relative group">
      <MapContainer 
        key={geoData?.city || 'default'} 
        center={center} 
        zoom={12} 
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <ChangeView center={center} />
        {/* Clear Satellite Map */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        />
        
        {/* Render true Polygon Mesh covering city sections */}
        {geoData.wards && geoData.wards.map((ward: any, idx: number) => {
          let positions: [number, number][] = [];
          try {
             // Extract coordinates (GeoJSON is [lng, lat], Leaflet expects [lat, lng])
             const coords = ward.geometry.type === 'Polygon' ? ward.geometry.coordinates[0] : ward.geometry.coordinates[0][0]; 
             positions = coords.map((c: number[]) => [c[1], c[0]]);
          } catch(e) { return null; }

          const styles = getColorAndSize(ward[activeLayer], activeLayer);

          return (
            <Polygon 
              key={`${ward.ward}-${idx}`}
              positions={positions}
              pathOptions={{ 
                fillColor: styles.color, 
                color: 'white', 
                weight: 1.5, // Thin crisp grid lines
                fillOpacity: 0.65 // Slightly transparent to let map show through
              }}
              eventHandlers={{
                mouseover: (e: any) => {
                  e.target.setStyle({ weight: 3, fillOpacity: 0.9, color: '#333' });
                },
                mouseout: (e: any) => {
                  e.target.setStyle({ weight: 1.5, fillOpacity: 0.65, color: 'white' });
                },
                click: () => {
                  if (onWardClick) onWardClick(ward);
                }
              }}
            >
              <div className="hidden">Hover to inspect sector</div>
            </Polygon>
          );
        })}
      </MapContainer>

      {/* Light Theme Map Legend */}
      <div className="absolute bottom-6 right-6 bg-white p-4 rounded-xl border border-slate-200 z-[400] text-xs font-bold text-slate-800 shadow-xl min-w-[180px]">
        <div className="flex items-center gap-2 mb-4 text-slate-500">
           <div className="w-2 h-2 rounded-full bg-blue-500"></div>
           <p className="uppercase tracking-[0.2em] font-black text-[10px]">
             {activeLayer === 'lst' ? 'Heat Intensity' : activeLayer === 'ndvi' ? 'Vegetation Index' : 'Pollutant Density'}
           </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center gap-4">
             <div className="flex gap-2 items-center">
                <span className={`w-3 h-3 rounded-full ${activeLayer === 'ndvi' ? 'bg-[#ecfdf5]' : activeLayer === 'pm25' ? 'bg-[#22c55e]' : 'bg-[#10b981]'}`}></span>
                <span className="text-slate-600 font-medium">{activeLayer === 'lst' ? 'Low Heat' : activeLayer === 'ndvi' ? 'Low Veg' : 'Good AQI'}</span>
             </div>
             <span className="font-bold text-slate-400">{activeLayer === 'lst' ? '<38°' : activeLayer === 'ndvi' ? '0.1' : '15'}</span>
          </div>
          
          <div className="flex justify-between items-center gap-4">
             <div className="flex gap-2 items-center">
                <span className={`w-3 h-4 rounded-full ${activeLayer === 'ndvi' ? 'bg-[#34d399]' : activeLayer === 'pm25' ? 'bg-[#facc15]' : 'bg-[#facc15]'}`}></span>
                <span className="text-slate-600 font-medium">{activeLayer === 'lst' ? 'Moderate' : activeLayer === 'ndvi' ? 'Medium' : 'Moderate'}</span>
             </div>
             <span className="font-bold text-slate-400">{activeLayer === 'lst' ? '41°' : activeLayer === 'ndvi' ? '0.2' : '30'}</span>
          </div>

          <div className="flex justify-between items-center gap-4">
             <div className="flex gap-2 items-center">
                <span className={`w-3 h-5 rounded-full ${activeLayer === 'ndvi' ? 'bg-[#059669]' : activeLayer === 'pm25' ? 'bg-[#dc2626]' : 'bg-[#dc2626]'}`}></span>
                <span className="text-slate-600 font-medium">{activeLayer === 'lst' ? 'Extreme' : activeLayer === 'ndvi' ? 'Dense Green' : 'Critical'}</span>
             </div>
             <span className="font-bold text-slate-400">{activeLayer === 'lst' ? '>44°' : activeLayer === 'ndvi' ? '0.4+' : '45+'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}