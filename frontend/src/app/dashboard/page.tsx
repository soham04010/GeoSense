// frontend/app/dashboard/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { fetchHeatmap, fetchAnomalies } from "@/lib/api";
import ReportDownload from "@/components/ReportDownload";

// Dynamically import the Leaflet map (using the Map.tsx code from my previous message)
const DynamicMap = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Dashboard() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "Ahmedabad";

  const [mapData, setMapData] = useState(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch both datasets simultaneously when the page loads
    Promise.all([fetchHeatmap(city), fetchAnomalies(city)])
      .then(([heatmapRes, anomaliesRes]) => {
        setMapData(heatmapRes);
        setAnomalies(anomaliesRes);
      })
      .catch((err) => console.error("Error fetching data", err))
      .finally(() => setLoading(false));
  }, [city]);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-2xl font-bold">Loading Satellite Data for {city}...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-emerald-400">SatEye Dashboard</h1>
          <p className="text-slate-400 text-lg">Monitoring: <span className="font-semibold text-white">{city}</span></p>
        </div>
        <ReportDownload city={city} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: The Map (Takes up 2/3 of the screen) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Live Urban Heat Island Map (LST)</h2>
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
            <DynamicMap geoJsonData={mapData} />
          </div>
        </div>

        {/* Right Column: ML Anomalies */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-red-400">⚠️ ML Anomaly Alerts</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {anomalies.length === 0 ? (
              <p className="text-slate-400 p-4 bg-slate-900 rounded-lg text-center">No anomalies detected.</p>
            ) : (
              anomalies.map((anomaly, idx) => (
                <div key={idx} className="bg-slate-900 border-l-4 border-red-500 p-4 rounded-r-lg shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg">{anomaly.ward_name}</span>
                    <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded font-bold">
                      {anomaly.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text-white">{anomaly.parameter}:</span> {anomaly.reason}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Detected: {anomaly.detected_at}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}