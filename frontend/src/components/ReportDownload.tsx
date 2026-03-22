"use client";

import React, { useState, useEffect } from "react";
import { generateReport } from "@/lib/api";

const LOADING_STEPS = [
  "Fetching satellite telemetry…",
  "Running ML climate models…",
  "Analysing air quality data…",
  "Compiling intervention plan…",
  "Building PDF report…",
];

export default function ReportDownload({ city }: { city: string }) {
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cycle loading step text while generating
  useEffect(() => {
    if (!loading) return;
    setStepIdx(0);
    const interval = setInterval(() => {
      setStepIdx((i) => (i + 1) % LOADING_STEPS.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [loading]);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    setDone(false);

    try {
      const blob = await generateReport(city);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${city}_GeoSense_Action_Plan.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.error("Failed to download report", err);
      setError("PDF generation failed. Please check the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="w-full flex flex-col items-center gap-3">
        <div className="w-full bg-red-500/10 border border-red-500/25 rounded-2xl px-5 py-4 text-center space-y-1">
          <p className="text-red-400 font-bold text-sm">Generation Failed</p>
          <p className="text-slate-500 text-xs leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Report Downloaded!
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`relative w-full group px-6 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-300 overflow-hidden ${
        loading
          ? "cursor-wait bg-slate-800 border border-slate-700"
          : "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:scale-[1.02]"
      }`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin shrink-0" />
            <span className="text-slate-300 transition-all duration-500">{LOADING_STEPS[stepIdx]}</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Action Plan PDF
          </>
        )}
      </span>
      {/* Hover shimmer */}
      {!loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  );
}