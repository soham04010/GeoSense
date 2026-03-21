import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function WardChart({ data }: { data: any }) {
  if (!data || !data.chart_data) return <div className="h-[400px] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 animate-pulse text-slate-500">Processing historical trends...</div>;

  const chartData = data.chart_data;

  return (
    <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl h-full flex flex-col shadow-2xl overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">120-Year Temperature Trend</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Instrumental Record (1901-2021)</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
          <p className="text-sm font-black text-red-400">+{data.total_warming || '1.44'}°C</p>
        </div>
      </div>
      
      <div className="h-[250px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="year" 
              stroke="#475569" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickCount={6}
            />
            <YAxis 
              stroke="#475569" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              domain={['dataMin - 0.2', 'dataMax + 0.2']}
              unit="°"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              cursor={{ stroke: '#475569', strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey="temperature" 
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTemp)" 
              animationDuration={2000}
            />
            <ReferenceLine y={24.5} stroke="#10b981" strokeDasharray="3 3" opacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
        <div className="group transition-all">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider group-hover:text-slate-400">2030 Forecast</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-orange-400 tracking-tighter">{data.predicted_2030 || '26.1'}°C</p>
            <span className="text-xs font-bold text-orange-400/50">↑</span>
          </div>
        </div>
        <div className="group transition-all">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider group-hover:text-slate-400">2050 Prediction</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-red-500 tracking-tighter">{data.predicted_2050 || '26.3'}°C</p>
            <span className="text-xs font-bold text-red-500/50">↑</span>
          </div>
        </div>
      </div>
    </div>
  );
}
