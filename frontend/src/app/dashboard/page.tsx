// frontend/app/dashboard/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { getCitySummary, getCityTrends, getCityAnomalies, getCityHeatmap, getAvailableCities, getCityInsights } from "@/lib/api";
import { CitySummary, CityTrends, CityAnomalies, CityHeatmap } from "@/types";

import ReportDownload from "@/components/ReportDownload";
import AICopilot from "@/components/AICopilot";
import PollutantChart from "@/components/PollutantChart";
import CityReport from "@/components/CityReport";

// Dynamically import client-side components
const DynamicMap = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-100 animate-pulse text-slate-500 font-medium text-sm">Loading map data...</div>
});

const getAQIStatus = (aqi: number) => {
  if (aqi <= 50) return { text: "Good", color: "#10b981", bg: "bg-[#10b981]" };
  if (aqi <= 100) return { text: "Satisfactory", color: "#84cc16", bg: "bg-[#84cc16]" };
  if (aqi <= 200) return { text: "Moderate", color: "#eab308", bg: "bg-[#eab308]" };
  if (aqi <= 300) return { text: "Poor", color: "#f97316", bg: "bg-[#f97316]" };
  if (aqi <= 400) return { text: "Very Poor", color: "#ef4444", bg: "bg-[#ef4444]" };
  return { text: "Severe", color: "#9f1239", bg: "bg-[#9f1239]" };
};

const AqiCharacter = ({ aqi }: { aqi: number }) => {
  let shirtColor = "#2ecc71"; // Good
  let state = "good";

  if (aqi <= 50) {
    shirtColor = "#2ecc71";
    state = "good";
  } else if (aqi <= 100) {
    shirtColor = "#f1c40f"; // Satisfactory
    state = "moderate";
  } else if (aqi <= 200) {
    shirtColor = "#e67e22"; // Moderate / Poor
    state = "poor";
  } else {
    shirtColor = "#e74c3c"; // Severe
    state = "severe";
  }

  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow" style={{ filter: 'drop-shadow(0px 6px 8px rgba(0,0,0,0.15))' }}>
      {/* Base Head & Hair */}
      <circle cx="50" cy="35" r="22" fill="#fcd9a9" />
      <path d="M32 28 C 45 5, 55 5, 68 28 Z" fill="#2d1c11" />
      
      {/* Dynamic Face & Expressions */}
      {state === "good" && (
        <>
          {/* Smiling Eyes */}
          <circle cx="42" cy="30" r="3" fill="#2d1c11"/>
          <circle cx="58" cy="30" r="3" fill="#2d1c11"/>
          {/* Happy eyebrows */}
          <path d="M38 25 Q 42 22 46 25" stroke="#2d1c11" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M54 25 Q 58 22 62 25" stroke="#2d1c11" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          {/* Big Smile */}
          <path d="M42 42 Q 50 50 58 42" stroke="#2d1c11" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </>
      )}

      {state === "moderate" && (
        <>
          {/* Concerned Eyes */}
          <circle cx="42" cy="30" r="3" fill="#2d1c11"/>
          <circle cx="58" cy="30" r="3" fill="#2d1c11"/>
          {/* Worried eyebrows */}
          <path d="M38 26 L 46 24" stroke="#2d1c11" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M62 26 L 54 24" stroke="#2d1c11" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Sad/Neutral Mouth */}
          <path d="M44 44 Q 50 40 56 44" stroke="#2d1c11" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </>
      )}

      {state === "poor" && (
        <>
          {/* Squinting Eyes */}
          <path d="M38 30 L 44 28 M38 30 L 44 32" stroke="#2d1c11" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M62 30 L 56 28 M62 30 L 56 32" stroke="#2d1c11" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Anguished eyebrows */}
          <path d="M38 24 L 46 28" stroke="#2d1c11" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M62 24 L 54 28" stroke="#2d1c11" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Coughing red cheek flush */}
          <circle cx="38" cy="40" r="4" fill="#ff7675" opacity="0.6"/>
          <circle cx="62" cy="40" r="4" fill="#ff7675" opacity="0.6"/>
          {/* Hand covering mouth (coughing) */}
          <path d="M44 55 Q 50 35 56 55 Z" fill="#fcd9a9" stroke="#daaf7c" strokeWidth="1"/>
          <path d="M45 44 C 45 40 55 40 55 44" stroke="#cd9d68" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </>
      )}

      {state === "severe" && (
        <>
          {/* Extremely Sick / Squinting Eyes */}
          <path d="M38 30 L 46 30" stroke="#2d1c11" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M54 30 L 62 30" stroke="#2d1c11" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Sweat droplet */}
          <path d="M63 20 Q 65 24 63 26 Q 61 24 63 20" fill="#74b9ff"/>
          {/* Health Mask */}
          <path d="M34 38 Q 50 34 66 38 L 62 48 Q 50 54 38 48 Z" fill="#ffffff" stroke="#b2bec3" strokeWidth="1.5"/>
          <path d="M34 38 L 30 35 M66 38 L 70 35" stroke="#b2bec3" strokeWidth="1.5" strokeLinecap="round"/>
        </>
      )}

      {/* Dynamic Clothing (Kurta/Shirt) */}
      <path d="M32 55 Q 50 50 68 55 L 75 95 L 25 95 Z" fill={shirtColor} rx="5" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
      
      {/* Shirt Collar / Details */}
      <path d="M45 53 L 50 65 L 55 53" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="50" y1="65" x2="50" y2="95" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
      
      {/* Arms crossing or by side depending on state */}
      {state === "poor" ? (
         <path d="M30 57 Q 28 75 44 55" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      ) : (
         <>
           <path d="M30 57 L 26 80" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeLinecap="round"/>
           <path d="M70 57 L 74 80" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeLinecap="round"/>
         </>
      )}
    </svg>
  );
};

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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [currentLayer, setCurrentLayer] = useState<'lst' | 'ndvi' | 'pm25'>('pm25');
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);

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
        const [sumRes, trendRes, anomRes, heatRes, insightsRes] = await Promise.all([
          getCitySummary(city),
          getCityTrends(city),
          getCityAnomalies(city),
          getCityHeatmap(city),
          getCityInsights(city)
        ]);
        
        setSummary(sumRes);
        setTrends(trendRes);
        setAnomalies(anomRes);
        setHeatmap(heatRes);
        setInsights(insightsRes);
        setSelectedWard(null);
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

  const handleDownloadReport = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
      const response = await fetch(`${API_URL}/api/report/generate?city=${city}`, { method: 'POST' });
      if (!response.ok) throw new Error('Report generation failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${city}_SATEYE_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Could not generate report. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Loading geospatial layers...</p>
      </div>
    );
  }

  const handleWardClick = (ward: any) => {
    setSelectedWard(ward);
  };

  const activeData = selectedWard ? {
    name: selectedWard.ward,
    pm25: selectedWard.pm25,
    pm10: selectedWard.pm10,
    co: Math.round((selectedWard.pm25 * 5.2)), // Approximated
    so2: selectedWard.so2,
    no2: selectedWard.no2,
    ozone: selectedWard.ozone,
    aqi: selectedWard.aqi || Math.round(selectedWard.pm25 * 1.5)
  } : {
    name: city,
    pm25: summary?.pm25,
    pm10: summary?.all_pollutants?.PM10 || Math.round((summary?.pm25||40)*1.4),
    co: 476, // fallback
    so2: summary?.all_pollutants?.SO2 || 9,
    no2: summary?.all_pollutants?.NO2 || 23,
    ozone: summary?.all_pollutants?.Ozone || 42,
    aqi: Math.round((summary?.pm25||42)*1.5)
  };

  const status = getAQIStatus(activeData.aqi || 50);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#e5e7eb] font-sans selection:bg-blue-100">
      
      {/* MAP LAYER BASE */}
      <div className="absolute inset-0 z-0">
        <DynamicMap geoData={heatmap} activeLayer={currentLayer} onWardClick={handleWardClick} />
      </div>

      {/* FLOATING TOP SEARCH CONTROL EXACT AQI.IN */}
      <div className="absolute top-4 inset-x-0 flex justify-center z-[500] pointer-events-none">
        <div className="pointer-events-auto flex items-center bg-[#f2f4f7]/80 backdrop-blur-[2rem] h-[48px] rounded-[1.7em] shadow-sm border border-white/50 px-4 min-w-[32rem] sm:min-w-[42rem] transition-all hover:border-blue-400 hover:shadow-md">
          {/* Search Input Box */}
          <div className="flex-1 flex items-center relative h-full">
            <svg className="w-[1.1rem] h-[1.1rem] text-slate-500 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <select 
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full bg-transparent border-none text-[#495057] text-[1.1rem] font-medium px-4 focus:outline-none focus:ring-0 appearance-none cursor-pointer h-full"
            >
              <option value="" disabled>Search City...</option>
              {availableCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button className="p-1 rounded-full hover:bg-black/5 transition-colors text-blue-500 mr-2 shrink-0">
              <svg className="w-[1.2rem] h-[1.2rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <circle cx="12" cy="12" r="6" />
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M2 12h4m12 0h4" />
              </svg>
            </button>
          </div>

          <div className="h-[24px] w-px bg-slate-300 mx-2"></div>

          {/* Layer Select Dropdown */}
          <div className="flex items-center relative cursor-pointer h-full pr-2">
            <select 
               value={currentLayer}
               onChange={(e: any) => setCurrentLayer(e.target.value)}
               className="bg-transparent text-[#495057] text-[1.1rem] font-medium appearance-none focus:outline-none pl-3 pr-8 cursor-pointer h-full"
            >
               <option value="pm25">Air Quality</option>
               <option value="lst">Surface Temp</option>
               <option value="ndvi">Vegetation</option>
            </select>
            <svg className="absolute right-1 w-[1.1rem] h-[1.1rem] text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Divider */}
          <div className="h-[24px] w-px bg-slate-300 mx-2"></div>

          {/* PDF Report Download Button */}
          <button
            onClick={handleDownloadReport}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#3b82f6] hover:bg-[#2563eb] active:scale-95 text-white text-[0.95rem] font-semibold rounded-full transition-all duration-200 shadow-sm shrink-0 disabled:opacity-70"
          >
            {pdfLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Report</span>
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
              </>
            )}
          </button>
        </div>
      </div>

      {/* LEFT SIDE PANEL UNIFIED ENVIRONMENTAL INTELLIGENCE */}
      <div className="absolute top-[88px] left-6 bottom-6 w-[380px] bg-white/80 backdrop-blur-[2rem] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E8ECF4] z-[500] flex flex-col overflow-hidden">
        
        {/* --- STATIC HEADER & PRIMARY METRICS (Never Scrolls) --- */}
        <div className="px-8 pt-6 pb-2 shrink-0">
          {/* Brand Header */}
          <div className="flex items-center gap-2 mb-3 mt-2">
            <h2 className="text-[20px] font-bold text-[#343a40] tracking-tight flex items-center">
              <span className={`font-black mr-2 text-[22px] ${
                 currentLayer === 'pm25' ? 'text-blue-500' : 
                 currentLayer === 'lst' ? 'text-red-500' : 'text-green-500'
              }`}>
                 SATEYE
                 <span className="text-[8px] align-top relative -top-1">®</span>
              </span>
              {currentLayer === 'pm25' ? 'Air Quality Map' : 
               currentLayer === 'lst' ? 'Urban Heat Island Map' : 'Vegetation Cover Map'}
            </h2>
          </div>
          
          {/* Location Title */}
          <div className="flex items-start gap-1.5 mb-2">
            <svg className={`w-6 h-6 shrink-0 fill-transparent ${
                 currentLayer === 'pm25' ? 'text-blue-500' : 
                 currentLayer === 'lst' ? 'text-red-500' : 'text-green-500'
              }`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <div>
              <h3 className={`font-bold text-[1.4rem] leading-tight ${
                 currentLayer === 'pm25' ? 'text-blue-500' : 
                 currentLayer === 'lst' ? 'text-red-500' : 'text-green-500'
              }`}>{activeData.name}</h3>
              <p className="text-[#9ca5ad] text-[0.85rem] font-medium leading-tight mt-0.5">{city}, Gujarat, India</p>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="px-8 shrink-0">
           <div className="h-px w-full bg-[#E8ECF4] my-2"></div>
        </div>

        {/* Primary Layer Analytics Block (Static) */}
        <div className="px-8 shrink-0">
           {/* PM2.5 AQI BLOCK */}
           {currentLayer === 'pm25' && (
              <div className="flex items-start justify-between mt-2">
                 <div>
                    <p className="text-[#6c757d] text-[13px] font-medium mb-1 flex items-center gap-1.5 font-sans">
                      <svg className="w-[18px] h-[18px] text-[#adb5bd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" /></svg>
                      Air Quality Index
                    </p>
                    <div className="flex items-center gap-3">
                       <span className="text-[5.5rem] leading-[1] font-black tracking-tighter" style={{ color: status.color }}>{activeData.aqi}</span>
                       <div className="px-4 py-1.5 rounded-[0.5rem] text-white font-bold text-[15px] shadow-sm whitespace-nowrap" style={{ backgroundColor: status.color }}>
                          {status.text}
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {/* LST URBAN HEAT BLOCK */}
           {currentLayer === 'lst' && (
              <div className="flex items-start justify-between mt-2">
                 <div>
                    <p className="text-[#6c757d] text-[13px] font-medium mb-1 flex items-center gap-1.5 font-sans">
                      <svg className="w-[18px] h-[18px] text-[#adb5bd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      LST (Surface Temp)
                    </p>
                    <div className="flex items-center gap-3">
                       <span className="text-[5.5rem] leading-[1] font-black tracking-tighter" style={{ color: (selectedWard ? selectedWard.lst : summary?.all_pollutants?.LST || 42) > 40 ? '#ef4444' : '#f97316' }}>
                          {selectedWard ? selectedWard.lst : summary?.all_pollutants?.LST || 42.1}
                       </span>
                       <div className="flex flex-col">
                          <span className="text-[2rem] font-black text-[#343a40]">°C</span>
                          <div className="px-3 py-1 rounded-[0.5rem] text-white font-bold text-[12px] shadow-sm whitespace-nowrap bg-red-500">
                             Severe Heat
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="w-[90px] h-[110px] shrink-0 flex items-center justify-center -mr-2 mt-4">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                       <rect x="40" y="20" width="20" height="50" rx="10" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2"/>
                       <circle cx="50" cy="75" r="18" fill="#ef4444" />
                       <rect x="44" y="45" width="12" height="30" fill="#ef4444"/>
                       <path d="M50 75 Q 80 50 50 10" stroke="#fca5a5" strokeWidth="3" fill="none" opacity="0.5"/>
                    </svg>
                 </div>
              </div>
           )}

           {/* NDVI VEGETATION BLOCK */}
           {currentLayer === 'ndvi' && (
              <div className="flex items-start justify-between mt-2">
                 <div>
                    <p className="text-[#6c757d] text-[13px] font-medium mb-1 flex items-center gap-1.5 font-sans">
                      <svg className="w-[18px] h-[18px] text-[#adb5bd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                      NDVI (Vegetation)
                    </p>
                    <div className="flex items-center gap-3">
                       <span className="text-[5.5rem] leading-[1] font-black tracking-tighter" style={{ color: (selectedWard ? selectedWard.ndvi : summary?.all_pollutants?.NDVI || 0.25) > 0.4 ? '#10b981' : '#f59e0b' }}>
                          {selectedWard ? selectedWard.ndvi : summary?.all_pollutants?.NDVI || 0.25}
                       </span>
                       <div className="flex flex-col">
                          <span className="text-[2rem] font-black text-[#343a40]">idx</span>
                          <div className="px-3 py-1 rounded-[0.5rem] text-white font-bold text-[12px] shadow-sm whitespace-nowrap bg-yellow-500">
                             Sparse Cover
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="w-[90px] h-[110px] shrink-0 flex items-center justify-center -mr-2 mt-4">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                       <path d="M50 90 L 50 60" stroke="#8B4513" strokeWidth="8" strokeLinecap="round"/>
                       <path d="M50 70 Q 60 55 70 50" stroke="#8B4513" strokeWidth="6" strokeLinecap="round" fill="none"/>
                       <path d="M50 80 Q 40 65 30 55" stroke="#8B4513" strokeWidth="6" strokeLinecap="round" fill="none"/>
                       <circle cx="50" cy="40" r="25" fill="#facc15" opacity="0.9"/>
                       <circle cx="35" cy="50" r="15" fill="#a3e635" opacity="0.8"/>
                       <circle cx="70" cy="45" r="18" fill="#a3e635" opacity="0.8"/>
                    </svg>
                 </div>
              </div>
           )}
        </div>

        {/* --- SCROLLING ANALYTICAL SUB-METRICS --- */}
        {/* Hiding ugly default scrollbar completely via tailwind pseudo-selectors */}
        <div className="flex-1 overflow-y-auto px-8 pb-4 mt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] border-t border-transparent">
           
           {/* PM2.5 AQI Details */}
           {currentLayer === 'pm25' && (
              <>
                 <div className="bg-white rounded-[1rem] shadow-sm border border-[#E8ECF4] overflow-hidden mb-4">
                    {[
                      { key: 'PM2.5', label: 'PM₂.₅', value: activeData.pm25, unit: 'µg/m³', max: 150 },
                      { key: 'PM10', label: 'PM₁₀', value: activeData.pm10, unit: 'µg/m³', max: 200 },
                      { key: 'CO', label: 'CO', value: activeData.co, unit: 'ppb', max: 1000 },
                      { key: 'SO2', label: 'SO₂', value: activeData.so2, unit: 'ppb', max: 50 },
                      { key: 'NO2', label: 'NO₂', value: activeData.no2, unit: 'ppb', max: 50 },
                      { key: 'O3', label: 'O₃', value: activeData.ozone, unit: 'ppb', max: 100 }
                    ].map((item, i) => (
                      <div key={item.key} className={`flex items-center justify-between px-6 py-[12px] ${i !== 5 ? 'border-b border-[#E8ECF4]' : ''}`}>
                         <div className="w-[70px] text-[1.05rem] font-medium text-[#495057] flex items-center gap-1.5">
                           {item.label} <span className="text-[10px] text-gray-400 font-bold block mt-0.5">↗</span>
                         </div>
                         <div className="flex-1 flex justify-center items-baseline gap-1">
                           <span className="text-[1.1rem] font-bold text-[#343a40]">{item.value || 0}</span>
                           <span className="text-[0.8rem] text-[#adb5bd] font-medium ml-0.5">{item.unit}</span>
                         </div>
                         <div className="w-[60px] flex items-center justify-end">
                           <div className="w-[60px] h-[4px] bg-[#f2f4f7] rounded-full relative overflow-hidden">
                              <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${Math.min(((item.value||0) / item.max) * 100, 100)}%`, backgroundColor: ((item.value||0) > (item.max*0.6)) ? '#f1c40f' : '#2ecc71' }}></div>
                           </div>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* Trend Chart */}
                 <div className="bg-white rounded-[1rem] shadow-sm border border-[#E8ECF4] overflow-hidden">
                    <div className="px-6 py-5 pb-0">
                       <h4 className="text-[1.05rem] font-medium text-[#6c757d]">AQI Trend Last 24 hour</h4>
                    </div>
                    <div className="h-[130px] w-full pt-4">
                       {trends && <PollutantChart data={trends} />}
                    </div>
                    <div className="text-center pb-4 text-[#8a96a1] font-medium text-[0.8rem] italic mt-1">
                       {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString().slice(0,5)} (Local Time)
                    </div>
                 </div>
              </>
           )}

           {/* LST URBAN HEAT Details */}
           {currentLayer === 'lst' && (
              <div className="bg-white rounded-[1rem] shadow-sm border border-[#E8ECF4] overflow-hidden mb-2">
                 {[
                   { label: 'Surface Temp', val: (selectedWard ? selectedWard.lst : summary?.all_pollutants?.LST || 42.1), unit: '°C' },
                   { label: 'Heat Anomaly', val: '+4.5', unit: '°C' },
                   { label: 'Albedo Index', val: '0.15', unit: 'idx' },
                   { label: 'Relative Hum.', val: '43', unit: '%' },
                   { label: 'Solar Irrad.', val: '850', unit: 'W/m²' },
                 ].map((item, i) => (
                   <div key={item.label} className={`flex items-center justify-between px-6 py-[16px] border-b border-[#E8ECF4] last:border-b-0`}>
                      <div className="flex-[1.5] text-[1.1rem] font-medium text-[#495057]">{item.label}</div>
                      <div className="flex-[1] text-right text-[1.2rem] font-bold text-[#343a40]">{item.val} <span className="text-[0.85rem] text-[#adb5bd] font-medium">{item.unit}</span></div>
                   </div>
                 ))}
              </div>
           )}

           {/* NDVI VEGETATION Details */}
           {currentLayer === 'ndvi' && (
              <div className="bg-white rounded-[1rem] shadow-sm border border-[#E8ECF4] overflow-hidden mb-2">
                 {[
                   { label: 'NDVI Score', val: (selectedWard ? selectedWard.ndvi : summary?.all_pollutants?.NDVI || 0.25), unit: 'idx' },
                   { label: 'Canopy Cover', val: '12', unit: '%' },
                   { label: 'Bare Soil', val: '45', unit: '%' },
                   { label: 'Built-up Area', val: '80', unit: '%' },
                   { label: 'Degradation', val: 'High', unit: 'risk' },
                 ].map((item, i) => (
                   <div key={item.label} className={`flex items-center justify-between px-6 py-[16px] border-b border-[#E8ECF4] last:border-b-0`}>
                      <div className="flex-[1.5] text-[1.1rem] font-medium text-[#495057]">{item.label}</div>
                      <div className="flex-[1] text-right text-[1.2rem] font-bold text-[#343a40]">{item.val} <span className="text-[0.85rem] text-[#adb5bd] font-medium">{item.unit}</span></div>
                   </div>
                 ))}
              </div>
           )}
        </div>

        {/* --- BOTTOM STICKY COLOR SCALE (Dynamic based on layer) --- */}
        {currentLayer === 'pm25' && (
           <div className="shrink-0 flex text-center text-white text-[12px] font-bold h-[28px] leading-[28px]">
             <div className="flex-1 bg-[#2ecc71] border-r border-white/20">0<span className="md:hidden">..</span><span className="hidden md:inline"> -</span></div>
             <div className="flex-[0.8] bg-[#2ecc71] border-r border-white/20">50</div>
             <div className="flex-[1.2] bg-[#f1c40f] border-r border-white/20">100</div>
             <div className="flex-1 bg-[#f39c12] border-r border-white/20">150</div>
             <div className="flex-1 bg-[#e67e22] border-r border-white/20">200</div>
             <div className="flex-1 bg-[#e74c3c]">300</div>
             <div className="flex-1 bg-[#8e44ad]">301+</div>
           </div>
        )}
        {currentLayer === 'lst' && (
           <div className="shrink-0 flex text-center text-white text-[12px] font-bold h-[28px] leading-[28px]">
             <div className="flex-1 bg-[#fcd34d] border-r border-white/20">{"< 30°"}</div>
             <div className="flex-1 bg-[#fbbf24] border-r border-white/20">{"35°"}</div>
             <div className="flex-1 bg-[#f59e0b] border-r border-white/20">{"40°"}</div>
             <div className="flex-1 bg-[#ea580c] border-r border-white/20">{"45°"}</div>
             <div className="flex-1 bg-[#dc2626]">{"50°+"}</div>
           </div>
        )}
        {currentLayer === 'ndvi' && (
           <div className="shrink-0 flex text-center text-white text-[12px] font-bold h-[28px] leading-[28px]">
             <div className="flex-1 bg-[#d97706] border-r border-white/20">0.0</div>
             <div className="flex-1 bg-[#eab308] border-r border-white/20">0.2</div>
             <div className="flex-1 bg-[#84cc16] border-r border-white/20">0.5</div>
             <div className="flex-1 bg-[#22c55e] border-r border-white/20">0.7</div>
             <div className="flex-1 bg-[#15803d]">1.0+</div>
           </div>
        )}
      </div>

      {/* ── CITY INTELLIGENCE REPORT RIGHT PANEL ── */}
      <div className="absolute top-[88px] right-6 bottom-6 w-[420px] bg-white/80 backdrop-blur-[2rem] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E8ECF4] z-[500] flex flex-col overflow-hidden">
        <CityReport insights={insights} />
      </div>

      {/* Floating AI Copilot remains unchanged but positioned around panels */}
      <AICopilot city={city} summary={summary} anomalies={anomalies} />
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium text-sm">Loading Application...</div>}>
      <DashboardContent />
    </Suspense>
  );
}