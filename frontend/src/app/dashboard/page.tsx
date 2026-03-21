// frontend/app/dashboard/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { getCitySummary, getCityTrends, getCityAnomalies, getCityHeatmap, getAvailableCities } from "@/lib/api";
import { CitySummary, CityTrends, CityAnomalies, CityHeatmap } from "@/types";

import StatBar from "@/components/StatBar";
import AlertCard from "@/components/AlertCard";
import ReportDownload from "@/components/ReportDownload";
import AICopilot from "@/components/AICopilot";

// Dynamically import client-side components
const DynamicMap = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse text-slate-500 uppercase font-black text-xs tracking-widest">Initializing Geospatial Engine...</div>
});


function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const city = searchParams.get("city") || "Ahmedabad";

  const [summary, setSummary] = useState<CitySummary | null>(null);
  const [trends, setTrends] = useState<CityTrends | null>(null);
  const [anomalies, setAnomalies] = useState<CityAnomalies | null>(null);
  const [heatmap, setHeatmap] = useState<CityHeatmap | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLayer, setCurrentLayer] = useState<'lst' | 'ndvi' | 'pm25'>('lst');

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const cities = await getAvailableCities();
        setAvailableCities(cities);
      } catch (err) {
        console.error("Error fetching available cities", err);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sumRes, trendRes, anomRes, heatRes] = await Promise.all([
          getCitySummary(city),
          getCityTrends(city),
          getCityAnomalies(city),
          getCityHeatmap(city)
        ]);
        
        setSummary(sumRes);
        setTrends(trendRes);
        setAnomalies(anomRes);
        setHeatmap(heatRes);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city]);

  const handleCityChange = (newCity: string) => {
    if (newCity) {
      router.push(`/dashboard?city=${newCity}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white space-y-6">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tight uppercase italic text-emerald-500">Synchronizing Local Data</h2>
          <p className="text-slate-500 font-mono text-sm mt-2 uppercase">Analyzing CSV Repositories for {city}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black tracking-tighter uppercase">LOCAL DATA INTELLIGENCE</div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none italic uppercase">
                {city} <span className="text-emerald-500 not-italic">Engine</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Synchronized with CPCB & Gujarat 2018 CSV Archives
            </p>
            <div className="relative mt-4 group">
              <select 
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="bg-slate-900/80 backdrop-blur-xl border border-white/10 text-slate-200 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-4 rounded-2xl w-full md:w-[400px] focus:outline-none focus:border-emerald-500/50 transition-all shadow-2xl appearance-none cursor-pointer hover:bg-slate-800"
              >
                <option value="" disabled>Search CSV-Available Cities...</option>
                {availableCities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="absolute right-6 top-5 pointer-events-none text-emerald-500/40 text-[10px]">▼</div>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => window.open(`http://localhost:8001/api/city/${city}/map`, '_blank')}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-full border border-slate-700 transition-all active:scale-95 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              View Static Heatmap (Folium)
            </button>
            <ReportDownload city={city} />
          </div>
        </header>

        <section className="animate-fade-in-up">
          <StatBar data={summary} />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Jurisdictional Heatmap <span className="text-emerald-500/50 ml-1">({currentLayer.toUpperCase()})</span></h2>
            <div className="flex gap-2">
              {(['lst', 'ndvi', 'pm25'] as const).map((l) => (
                <button 
                  key={l}
                  onClick={() => setCurrentLayer(l)}
                  className={`px-3 py-1 text-[10px] font-black rounded-full transition-all border ${currentLayer === l ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <DynamicMap geoData={heatmap} activeLayer={currentLayer} />
          </div>
        </section>


        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">CSV Anomaly Highlights</h2>
            <div className="h-px flex-grow bg-white/5"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {anomalies?.alerts.map((alert, idx) => (
              <AlertCard key={idx} alert={alert} />
            ))}
            {(!anomalies || anomalies.alerts.length === 0) && (
              <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 border-dashed">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs tracking-widest">No Dataset Anomalies Found</p>
              </div>
            )}
          </div>
        </section>

        <footer className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-600 text-[10px] font-bold uppercase tracking-widest gap-4">
          <p>© 2026 SatEye Platform — Local CSV Data Integration Edition</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-emerald-500 transition-colors">Data Policy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Methodology</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Dev Support</a>
          </div>
        </footer>
      </div>

      {/* Floating AI Copilot */}
      <AICopilot city={city} summary={summary} anomalies={anomalies} />
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-black tracking-widest text-xl animate-pulse uppercase italic">Accessing CSV Records...</div>}>
      <DashboardContent />
    </Suspense>
  );
}