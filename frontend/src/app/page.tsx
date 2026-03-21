// frontend/app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [city, setCity] = useState("Ahmedabad");
  const router = useRouter();

  const handleLaunch = () => {
    // Navigate to the dashboard and pass the city in the URL
    router.push(`/dashboard?city=${city}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          SatEye
        </h1>
        <p className="text-xl text-slate-400">
          Satellite Environmental Intelligence Platform for Smart Cities. 
          Bridging the gap between space data and municipal action.
        </p>

        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col text-left space-y-2">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Select City to Monitor</label>
            <select 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="p-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Ahmedabad">Ahmedabad, Gujarat</option>
              <option value="Surat">Surat, Gujarat</option>
              <option value="Delhi">New Delhi, NCR</option>
            </select>
          </div>
          
          <button 
            onClick={handleLaunch}
            className="w-full py-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-all font-bold text-lg text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          >
            Launch City Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}