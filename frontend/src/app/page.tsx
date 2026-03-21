// frontend/app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [city, setCity] = useState("Ahmedabad");
  const [isLaunching, setIsLaunching] = useState(false);
  const router = useRouter();

  const handleLaunch = () => {
    setIsLaunching(true);
    // Add a small delay for a premium feel
    setTimeout(() => {
      router.push(`/dashboard?city=${city}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
      
      <div className="max-w-3xl text-center space-y-12 relative z-10">
        <div className="space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-[0.3em] uppercase mb-4 animate-fade-in">
            ENVIRONMENTAL INTELLIGENCE
          </div>
          <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 drop-shadow-2xl">
            SatEye
          </h1>
          <p className="text-xl text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
            Bridging the gap between <span className="text-emerald-400 font-bold">Satellite Observations</span> and <span className="text-cyan-400 font-bold">Municipal Action</span> for a sustainable urban future.
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8 max-w-md mx-auto">
          <div className="flex flex-col text-left space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Select Jurisdiction</label>
            <div className="relative group">
              <select 
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-white font-bold appearance-none focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all cursor-pointer group-hover:border-emerald-500/30"
              >
                <option value="Ahmedabad">Ahmedabad, Gujarat</option>
                <option value="Surat">Surat, Gujarat</option>
                <option value="Vadodara">Vadodara, Gujarat</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLaunch}
            disabled={isLaunching}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all relative overflow-hidden group ${
              isLaunching ? 'scale-95 opacity-80 cursor-wait' : 'hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)]'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600"></div>
            <div className="relative z-10 flex items-center justify-center gap-2">
              {isLaunching ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>INITIALIZING...</span>
                </>
              ) : (
                <>
                  <span>OPEN DASHBOARD</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </>
              )}
            </div>
          </button>
        </div>

        <div className="pt-8 grid grid-cols-3 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           {/* Mock logos or mentions */}
           <div className="text-[10px] font-black tracking-widest uppercase">ISRO DATA</div>
           <div className="text-[10px] font-black tracking-widest uppercase">GEE ENGINE</div>
           <div className="text-[10px] font-black tracking-widest uppercase">CPCB ANALYTICS</div>
        </div>
      </div>
    </div>
  );
}