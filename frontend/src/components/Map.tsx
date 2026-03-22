import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon in Next.js
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

// ── India CPCB AQI standard color + label ─────────────────────────────────
// AQI  0 –  50 : Good          #22c55e  green
// AQI 51 – 100 : Satisfactory  #84cc16  lime
// AQI 101– 200 : Moderate      #eab308  yellow
// AQI 201– 300 : Poor          #f97316  orange
// AQI 301– 400 : Very Poor     #ef4444  red
// AQI 401– 500 : Severe        #9f1239  dark red / maroon
function aqiColor(aqi: number): string {
  if (aqi <= 50)  return '#22c55e';
  if (aqi <= 100) return '#84cc16';
  if (aqi <= 200) return '#eab308';
  if (aqi <= 300) return '#f97316';
  if (aqi <= 400) return '#ef4444';
  return '#9f1239';
}

function aqiLabel(aqi: number): string {
  if (aqi <= 50)  return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

// LST (°C) color scale
function lstColor(lst: number): string {
  if (lst > 44) return '#7f1d1d';
  if (lst > 42) return '#dc2626';
  if (lst > 40) return '#f97316';
  if (lst > 38) return '#facc15';
  return '#22c55e';
}

// NDVI color scale (low = bad/red, high = green)
function ndviColor(ndvi: number): string {
  if (ndvi < 0.1) return '#ef4444';
  if (ndvi < 0.2) return '#f97316';
  if (ndvi < 0.3) return '#facc15';
  if (ndvi < 0.4) return '#84cc16';
  return '#22c55e';
}

function getColor(ward: any, layer: string): string {
  if (layer === 'lst')  return lstColor(ward.lst ?? 38);
  if (layer === 'ndvi') return ndviColor(ward.ndvi ?? 0.25);
  // pm25 / AQI layer — use real AQI if available, else derive from PM2.5
  const aqi = ward.aqi ?? Math.round((ward.pm25 ?? 60) * 1.6);
  return aqiColor(aqi);
}

export default function SatEyeMap({
  geoData,
  activeLayer = 'pm25',
  onWardClick,
}: {
  geoData: any;
  activeLayer?: 'lst' | 'ndvi' | 'pm25';
  onWardClick?: (ward: any) => void;
}) {
  const center: [number, number] = geoData?.center || [23.0225, 72.5714];

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
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        />

        {geoData.wards && geoData.wards.map((ward: any, idx: number) => {
          let positions: [number, number][] = [];
          try {
            const coords =
              ward.geometry.type === 'Polygon'
                ? ward.geometry.coordinates[0]
                : ward.geometry.coordinates[0][0];
            positions = coords.map((c: number[]) => [c[1], c[0]]);
          } catch (e) {
            return null;
          }

          const color = getColor(ward, activeLayer);
          const aqi   = ward.aqi ?? Math.round((ward.pm25 ?? 60) * 1.6);

          return (
            <Polygon
              key={`${ward.ward}-${idx}`}
              positions={positions}
              pathOptions={{
                fillColor: color,
                color: 'rgba(255,255,255,0.5)',
                weight: 1,
                fillOpacity: 0.70,
              }}
              eventHandlers={{
                mouseover: (e: any) => {
                  e.target.setStyle({ weight: 2.5, fillOpacity: 0.92, color: '#fff' });
                },
                mouseout: (e: any) => {
                  e.target.setStyle({ weight: 1, fillOpacity: 0.70, color: 'rgba(255,255,255,0.5)' });
                },
                click: () => {
                  if (onWardClick) onWardClick(ward);
                },
              }}
            >
              {/* Hover tooltip with real values */}
              <Tooltip sticky direction="top" offset={[0, -4]} opacity={0.97}>
                <div style={{ fontFamily: 'sans-serif', fontSize: 12, lineHeight: 1.6, minWidth: 150 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2, color: '#1e293b' }}>{ward.ward}</div>
                  {activeLayer === 'pm25' && (
                    <>
                      <div>AQI: <b style={{ color }}>{aqi}</b> — {aqiLabel(aqi)}</div>
                      <div>PM₂.₅: <b>{ward.pm25}</b> µg/m³</div>
                      {ward.no2 !== undefined && <div>NO₂: <b>{ward.no2}</b> ppb</div>}
                    </>
                  )}
                  {activeLayer === 'lst' && (
                    <div>Surface Temp: <b>{ward.lst}°C</b></div>
                  )}
                  {activeLayer === 'ndvi' && (
                    <div>NDVI: <b>{ward.ndvi}</b></div>
                  )}
                </div>
              </Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>

      {/* Map Legend — India CPCB standard */}
      <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur p-4 rounded-2xl border border-slate-200 z-[400] text-xs font-bold text-slate-800 shadow-xl min-w-[195px]">
        <p className="uppercase tracking-[0.18em] font-black text-[9px] text-slate-400 mb-3">
          {activeLayer === 'lst' ? 'Heat Intensity' : activeLayer === 'ndvi' ? 'Vegetation Index' : 'AQI — India CPCB Scale'}
        </p>

        {activeLayer === 'pm25' && (
          <div className="space-y-2">
            {[
              { color: '#22c55e', label: 'Good',        range: '0 – 50' },
              { color: '#84cc16', label: 'Satisfactory', range: '51 – 100' },
              { color: '#eab308', label: 'Moderate',    range: '101 – 200' },
              { color: '#f97316', label: 'Poor',        range: '201 – 300' },
              { color: '#ef4444', label: 'Very Poor',   range: '301 – 400' },
              { color: '#9f1239', label: 'Severe',      range: '401 – 500' },
            ].map(({ color, label, range }) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-slate-600 font-medium">{label}</span>
                </div>
                <span className="text-slate-400 font-semibold">{range}</span>
              </div>
            ))}
          </div>
        )}

        {activeLayer === 'lst' && (
          <div className="space-y-2">
            {[
              { color: '#22c55e', label: 'Normal',   range: '< 38°' },
              { color: '#facc15', label: 'Warm',     range: '38–40°' },
              { color: '#f97316', label: 'Hot',      range: '40–42°' },
              { color: '#dc2626', label: 'Very Hot', range: '42–44°' },
              { color: '#7f1d1d', label: 'Extreme',  range: '> 44°' },
            ].map(({ color, label, range }) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-slate-600 font-medium">{label}</span>
                </div>
                <span className="text-slate-400 font-semibold">{range}</span>
              </div>
            ))}
          </div>
        )}

        {activeLayer === 'ndvi' && (
          <div className="space-y-2">
            {[
              { color: '#ef4444', label: 'Barren',    range: '< 0.1' },
              { color: '#f97316', label: 'Sparse',    range: '0.1–0.2' },
              { color: '#facc15', label: 'Moderate',  range: '0.2–0.3' },
              { color: '#84cc16', label: 'Healthy',   range: '0.3–0.4' },
              { color: '#22c55e', label: 'Dense',     range: '> 0.4' },
            ].map(({ color, label, range }) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-slate-600 font-medium">{label}</span>
                </div>
                <span className="text-slate-400 font-semibold">{range}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}