"use client";

import { useSearchParams } from "next/navigation";
import ReportDownload from "@/components/ReportDownload";

import { Suspense } from "react";

function ReportContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "Ahmedabad";

  return (
    <div className="min-h-screen bg-[#020617] text-white p-10 flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl font-black tracking-tight italic">SatEye <span className="text-emerald-400 not-italic">Report Generator</span></h1>
        <p className="text-slate-400 font-medium">
          Your custom Environment Action Plan for <span className="text-white font-bold">{city}</span> is ready for synthesis. 
          This plan includes climate trend analysis, air quality assessment, and ward-level risk mapping from ISRO/GEE data.
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-2xl p-16 rounded-[3rem] border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center space-y-10 group">
         <div className="w-24 h-32 border-2 border-slate-700/50 rounded-xl flex items-center justify-center bg-slate-800/30 group-hover:border-red-500/30 transition-all duration-500 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500/40 group-hover:text-red-500/80 transition-all"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-20"></div>
         </div>
         <ReportDownload city={city} />
         <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">System ID: SatEye-GEN-2026</p>
      </div>

      <button 
        onClick={() => window.history.back()}
        className="text-slate-500 hover:text-white text-xs font-black uppercase tracking-[0.2em] transition-all hover:tracking-[0.3em] flex items-center gap-3"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Return to Dashboard
      </button>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-black tracking-widest text-xl animate-pulse uppercase">Synthesizing Environmental Report...</div>}>
      <ReportContent />
    </Suspense>
  );
}
