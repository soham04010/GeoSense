"use client";

import { useSearchParams } from "next/navigation";
import ReportDownload from "@/components/ReportDownload";
import { Suspense } from "react";

const REPORT_SECTIONS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" /><path d="M16 2l2 2 2-2" />
      </svg>
    ),
    title: "Climate Trend Analysis",
    desc: "Historical warming trajectory & 2050 projections",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
      </svg>
    ),
    title: "Air Quality Assessment",
    desc: "PM2.5, NO2, AQI & pollutant breakdown",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Risk Matrix & Alerts",
    desc: "Heat island, vegetation loss & anomaly flags",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: "Priority Interventions",
    desc: "P1–P5 civic action directives & impact scores",
  },
];

function ReportContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "Ahmedabad";

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden flex flex-col items-center justify-center px-4 py-16 gap-10">
      {/* Background glow layers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[350px] bg-cyan-500/8 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
      </div>

      {/* Header badge */}
      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest text-emerald-400 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Satellite Intelligence Report
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          <span className="text-white">GeoSense</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Report Engine
          </span>
        </h1>

        <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
          Your custom Environmental Intelligence Report for{" "}
          <span className="text-white font-bold">{city}</span> is ready for synthesis.
          Powered by MODIS, Sentinel, and GEE satellite data.
        </p>
      </div>

      {/* What's included */}
      <div className="relative w-full max-w-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-600 text-center mb-4">
          Included in your report
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REPORT_SECTIONS.map((s) => (
            <div
              key={s.title}
              className="flex items-start gap-3 bg-slate-900/60 backdrop-blur border border-white/5 rounded-2xl px-4 py-3.5 hover:border-emerald-500/25 transition-colors duration-300"
            >
              <span className="text-emerald-400 mt-0.5 shrink-0">{s.icon}</span>
              <div>
                <p className="text-sm font-bold text-white leading-tight">{s.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download card */}
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 blur-sm" />
        <div className="relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/8 p-10 flex flex-col items-center gap-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
          {/* PDF icon */}
          <div className="relative w-16 h-20 rounded-xl border border-slate-700/60 bg-slate-800/40 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-red-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="absolute -bottom-1.5 -right-1.5 text-[9px] font-black bg-red-500 text-white rounded px-1 py-0.5 leading-none tracking-wider">PDF</span>
          </div>

          <div className="text-center space-y-1">
            <p className="font-black text-white text-lg">{city} Action Plan</p>
            <p className="text-slate-500 text-xs">Full environmental intelligence document</p>
          </div>

          <ReportDownload city={city} />

          <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.3em]">
            System ID: GeoSense-RPT-2026
          </p>
        </div>
      </div>

      {/* Back link */}
      <button
        onClick={() => window.history.back()}
        className="relative text-slate-600 hover:text-slate-300 text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 hover:gap-3"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Return to Dashboard
      </button>

      {/* Data source note */}
      <p className="absolute bottom-4 text-[10px] text-slate-800 font-medium">
        Data sourced from MODIS · Sentinel-5P · ISRO · OpenAQ · WAQI
      </p>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
          <p className="text-emerald-500 font-black tracking-widest text-sm uppercase animate-pulse">
            Synthesizing Environmental Report…
          </p>
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  );
}
