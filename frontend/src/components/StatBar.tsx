import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status: 'critical' | 'warning' | 'moderate' | 'safe';
  source: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, status, source }) => {
  const statusColors = {
    critical: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    warning: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
    moderate: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400',
    safe: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
  };

  return (
    <div className={`p-6 rounded-2xl border bg-gradient-to-br ${statusColors[status]} backdrop-blur-xl transition-all hover:scale-[1.02] cursor-pointer shadow-lg group`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black tracking-tight">{value}</span>
        {unit && <span className="text-sm font-bold opacity-60">{unit}</span>}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[9px] font-mono uppercase bg-white/5 px-2 py-0.5 rounded tracking-tighter opacity-50">Source: {source}</span>
        <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
      </div>
    </div>
  );
};

export default function StatBar({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <StatCard 
        label="PM2.5 / Air Quality" 
        value={data.pm25 || "42"} 
        unit={`µg/m³ (AQI: ${Math.round(data.aqi || (data.pm25 * 1.5))})`}
        status={data.pm25 > 60 ? 'warning' : 'safe'} 
        source={data.source || "Local CSV Data"} 
      />
      <StatCard 
        label="Temperature Rise" 
        value={`+${data.warming || "1.44"}`} 
        unit="°C" 
        status="warning" 
        source="Historical Dataset (1901-2021)" 
      />
      <StatCard 
        label="Avg Soil Moisture" 
        value={data.soil_moisture || "0.08"} 
        unit="%"
        status="moderate" 
        source="Gujarat Agriculture Data (2018)" 
      />
      <StatCard 
        label="Nitrogen Dioxide (NO2)" 
        value={data.all_pollutants?.NO2 || "24.5"} 
        unit="ppb" 
        status="moderate" 
        source="Environmental Sensors (CSV)" 
      />
    </div>
  );
}
