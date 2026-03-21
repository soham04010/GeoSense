import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function PollutantChart({ data }: { data: any }) {
  // Generate a mock 24-hour trend to perfectly mirror the reference chart's "Last 24 hour" look
  const generateTrend = () => {
    const res = [];
    const baseVal = data?.pm25 || 110;
    for (let i = 0; i <= 24; i++) {
        // Create an organic looking curve that dips in the afternoon
        let val = baseVal + Math.sin(i / 3) * 30 + Math.cos(i / 6) * 20;
        res.push({
            time: `${i}:00`,
            aqi: Math.max(20, Math.round(val)),
            label: i === 0 ? '1:01am\n21-03-2026' : i === 12 ? '1:01pm' : i === 24 ? '1:01am\n22-03-2026' : ''
        });
    }
    return res;
  };

  const chartData = generateTrend();

  return (
    <div className="w-full h-full -ml-4">
       <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 5 }}>
             <defs>
               <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                 <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
               </linearGradient>
             </defs>
             <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#f1f5f9" />
             <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }}
                interval="preserveStartEnd"
                tickMargin={10}
             />
             <YAxis 
                axisLine={{ stroke: '#e2e8f0' }} 
                tickLine={false} 
                ticks={[50, 150]}
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                width={30}
             />
             <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             />
             <Area 
                type="monotone" 
                dataKey="aqi" 
                stroke="#ef4444" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorAqi)" 
                isAnimationActive={false}
             />
          </AreaChart>
       </ResponsiveContainer>
    </div>
  );
}
