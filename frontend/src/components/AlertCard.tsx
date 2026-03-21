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
    red: 'bg-red-50 border-red-100 text-red-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
    green: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  };

  const dotColors: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    green: 'bg-emerald-500',
  };

  return (
    <div className={`p-4 rounded-2xl border ${bgColors[alert.color] || bgColors.orange} shadow-sm flex flex-col h-full hover:shadow-md transition-all`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${dotColors[alert.color] || dotColors.orange} animate-pulse`}></div>
        <span className="text-[10px] font-black uppercase tracking-widest">{alert.level}</span>
        <span className="text-[9px] opacity-70 uppercase ml-auto font-bold">{alert.parameter.replace('_', ' ')}</span>
      </div>
      <p className="text-xs font-semibold leading-relaxed mb-3 text-slate-700">
        {alert.message}
      </p>
      <div className="mt-auto pt-3 border-t border-black/5">
        <p className="text-[9px] uppercase font-bold text-slate-500 mb-0.5 tracking-wider">Recommended Action</p>
        <p className="text-xs font-bold leading-tight text-slate-800">{alert.action}</p>
      </div>
    </div>
  );
}
