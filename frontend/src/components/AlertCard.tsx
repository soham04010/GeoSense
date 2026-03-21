import React from 'react';

interface Alert {
  parameter: string;
  level: string;
  color: string;
  message: string;
  action: string;
}

export default function AlertCard({ alert }: { alert: Alert }) {
  const bgColors: Record<string, string> = {
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    green: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  };

  const dotColors: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    green: 'bg-emerald-500',
  };

  return (
    <div className={`p-5 rounded-xl border ${bgColors[alert.color] || bgColors.orange} backdrop-blur-md shadow-lg flex flex-col h-full hover:bg-opacity-20 transition-all`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColors[alert.color] || dotColors.orange} animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]`}></div>
        <span className="text-xs font-black uppercase tracking-widest">{alert.level}</span>
        <span className="text-[10px] opacity-40 uppercase ml-auto font-bold">{alert.parameter.replace('_', ' ')}</span>
      </div>
      <p className="text-sm font-medium leading-relaxed mb-4 text-white/90">
        {alert.message}
      </p>
      <div className="mt-auto pt-4 border-t border-white/5">
        <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Recommended Action</p>
        <p className="text-xs font-bold leading-tight">{alert.action}</p>
      </div>
    </div>
  );
}
