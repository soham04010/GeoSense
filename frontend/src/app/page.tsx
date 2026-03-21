"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import WorldMap from "@/components/ui/world-map";

const MAP_DOTS = [
  { start: { lat: 23.02, lng: 72.57 }, end: { lat: 51.50, lng: -0.12 } },
  { start: { lat: 23.02, lng: 72.57 }, end: { lat: 40.71, lng: -74.0 } },
  { start: { lat: 23.02, lng: 72.57 }, end: { lat: 35.68, lng: 139.7 } },
  { start: { lat: 23.02, lng: 72.57 }, end: { lat: 28.61, lng: 77.21 } },
  { start: { lat: 23.02, lng: 72.57 }, end: { lat: -33.8, lng: 151.2 } },
  { start: { lat: 23.02, lng: 72.57 }, end: { lat: 55.75, lng: 37.61 } },
];

export default function LandingPage() {
  const [isLaunching, setIsLaunching] = useState(false);
  const router = useRouter();

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => router.push("/dashboard?city=Ahmedabad"), 900);
  };

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden relative">

      {/* ── World Map background ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `
              linear-gradient(to right,  white 0%, transparent 6%, transparent 94%, white 100%),
              linear-gradient(to bottom, white 0%, transparent 8%, transparent 88%, white 100%)
            `
          }} />
        <WorldMap dots={MAP_DOTS} lineColor="#0ea5e9" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-20 flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
          </div>
          <span className="font-black text-xs tracking-[0.25em] uppercase text-slate-800">
            SatEye
          </span>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-sky-600">
            LIVE · AHMEDABAD
          </span>
        </div>

        <div className="text-[10px] font-mono text-slate-400">
          {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="relative z-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center -mt-10">

        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white/90 backdrop-blur-sm mb-8 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-400">
            Satellite · Intelligence · Action
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-black tracking-[-0.04em] leading-[0.88] mb-6"
          style={{ fontSize: "clamp(3.5rem, 10vw, 8rem)" }}
        >
          <span className="block text-slate-900">Urban</span>
          <span className="block text-slate-800">Environmental</span>
          <span className="block text-slate-900">Intelligence</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-slate-600 text-base max-w-md leading-relaxed mb-12"
        >
          Real satellite data from{" "}
          <span className="text-slate-700 font-semibold">NASA MODIS</span>,{" "}
          <span className="text-slate-700 font-semibold">Landsat 9</span> &amp;{" "}
          <span className="text-slate-700 font-semibold">Sentinel-5P</span>
          {" "}— ward-level action plans for Ahmedabad.
        </motion.p>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          onClick={handleLaunch}
          disabled={isLaunching}
          className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm tracking-[0.08em] uppercase transition-all text-white
            ${isLaunching
              ? "opacity-60 scale-[0.97] cursor-wait"
              : "hover:scale-[1.03] hover:shadow-[0_8px_40px_-12px_rgba(14,165,233,0.5)] active:scale-[0.98]"
            }`}
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
            boxShadow: isLaunching ? "none" : "0 4px 24px -8px rgba(14,165,233,0.4)",
          }}
        >
          {isLaunching ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2.5" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Initializing...
            </>
          ) : (
            <>
              Open Dashboard
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                className="group-hover:translate-x-1 transition-transform"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </motion.button>

        {/* Data sources */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 flex items-center gap-6"
        >
          {["NASA MODIS", "USGS Landsat 9", "ESA Sentinel-5P", "CPCB India", "IMD"].map(s => (
            <span key={s} className="text-[9px] font-black tracking-[0.15em] uppercase text-slate-300 hover:text-slate-500 transition-colors">
              {s}
            </span>
          ))}
        </motion.div>

      </main>
    </div>
  );
}