import React from 'react';
import { Wind, Factory, ThermometerSun, Droplets, AlertTriangle, Trees, ClipboardList, Activity, ArrowUpRight, TrendingUp, AlertCircle } from 'lucide-react';

interface Threat {
  rank: number;
  parameter: string;
  icon: string;
  value: number;
  unit: string;
  threshold: number;
  severity: 'CRITICAL' | 'WARNING' | 'MODERATE';
  projection_year: number;
  projection_val: number;
  vs_national: string;
  recommendation: string;
}

interface Action {
  priority: number;
  title: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  timeline: string;
  detail: string;
  icon: string;
}

interface CityInsights {
  city: string;
  score: number;
  grade: string;
  headline: string;
  threats: Threat[];
  actions: Action[];
  vs_national: Record<string, string>;
  data_sources: string[];
}

// Minimalist severity configurations
const severityConfig = {
  CRITICAL: { 
    border: 'border-red-500/20 hover:border-red-500/40', 
    text: 'text-red-600', 
    badge: 'bg-red-50 text-red-600 border border-red-100', 
    bar: 'bg-red-500',
    iconColor: 'text-red-500'
  },
  WARNING: { 
    border: 'border-amber-500/20 hover:border-amber-500/40', 
    text: 'text-amber-600', 
    badge: 'bg-amber-50 text-amber-600 border border-amber-100', 
    bar: 'bg-amber-500',
    iconColor: 'text-amber-500'
  },
  MODERATE: { 
    border: 'border-emerald-500/20 hover:border-emerald-500/40', 
    text: 'text-emerald-600', 
    badge: 'bg-emerald-50 text-emerald-600 border border-emerald-100', 
    bar: 'bg-emerald-500',
    iconColor: 'text-emerald-500' 
  },
};

const impactConfig = {
  HIGH:   'bg-slate-800 text-white',
  MEDIUM: 'bg-slate-200 text-slate-700',
  LOW:    'bg-slate-100 text-slate-500',
};

const getIcon = (name: string, className?: string) => {
  const props = { className: className || 'w-5 h-5', strokeWidth: 1.5 };
  switch (name) {
    case 'wind': return <Wind {...props} />;
    case 'factory': return <Factory {...props} />;
    case 'thermometer': return <ThermometerSun {...props} />;
    case 'leaf': return <Trees {...props} />;
    case 'water': return <Droplets {...props} />;
    case 'alert': return <AlertTriangle {...props} />;
    case 'tree': return <Trees {...props} />;
    case 'plan': return <ClipboardList {...props} />;
    default: return <Activity {...props} />;
  }
};

function GradeScore({ score, grade }: { score: number; grade: string }) {
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#22c55e' : score >= 50 ? '#f59e0b' : score >= 35 ? '#f97316' : '#ef4444';
  
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="text-4xl font-black text-slate-800 tracking-tighter leading-none mb-1">
        {score}
      </div>
      <div 
        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
        style={{ backgroundColor: color }}
      >
        Grade {grade}
      </div>
    </div>
  );
}

function ThreatCard({ threat }: { threat: Threat }) {
  const cfg = severityConfig[threat.severity];
  const pct = Math.min(100, Math.round((threat.value / (threat.threshold * 2)) * 100));

  return (
    <div className={`bg-white rounded-2xl border ${cfg.border} p-5 transition-all shadow-sm hover:shadow-md`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-slate-50 ${cfg.iconColor}`}>
            {getIcon(threat.icon, "w-5 h-5")}
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-slate-800 leading-tight">{threat.parameter}</h4>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp className={`w-3 h-3 ${cfg.text}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>
                {threat.vs_national}
              </span>
            </div>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.badge}`}>
          #{threat.rank}
        </div>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{threat.value}</span>
          <span className="text-[11px] text-slate-500 font-semibold">{threat.unit}</span>
        </div>
        <div className="text-[10px] uppercase font-bold text-slate-400">
          Safe limit: <span className="text-slate-600">{threat.threshold}</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${cfg.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center justify-between border border-slate-100">
        <div className="flex flex-col">
           <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Projection {threat.projection_year}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-800">
           <span className={`text-[13px] font-black`}>{threat.projection_val}</span>
           <span className="text-[9px] font-semibold text-slate-500">{threat.unit}</span>
           <ArrowUpRight className={`w-3.5 h-3.5 ${cfg.text}`} />
        </div>
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
        {threat.recommendation}
      </p>
    </div>
  );
}

function ActionCard({ action }: { action: Action }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 transition-all hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 mt-1 shrink-0">
          {getIcon(action.icon, "w-5 h-5")}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">P{action.priority}</span>
              {action.title}
            </h4>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${impactConfig[action.impact]}`}>
              {action.impact} Impact
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-600 bg-slate-100 uppercase tracking-wider">
              {action.timeline}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            {action.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CityReport({ insights }: { insights: CityInsights | null }) {
  if (!insights) return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
       <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
       <p className="text-slate-500 font-semibold text-xs uppercase tracking-widest">Compiling Intelligence...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col px-6 py-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      
      {/* ── Header ── */}
      <div className="flex items-start gap-5 mb-8">
        <GradeScore score={insights.score} grade={insights.grade} />
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-1.5">
             <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
             <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
               AI Diagnostic Report
             </p>
          </div>
          <h2 className="text-[15px] font-bold text-slate-800 leading-snug mb-3">
             {insights.headline}
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(insights.vs_national).map(([k, v]) => (
              <div key={k} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                <span className="text-[9px] font-bold text-slate-500 uppercase">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Threats ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Primary Threats</h3>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider shrink-0 bg-slate-100 px-2 py-0.5 rounded-full">Ranked Severity</span>
        </div>
        <div className="flex flex-col gap-4">
          {insights.threats.map(t => <ThreatCard key={t.rank} threat={t} />)}
        </div>
      </div>

      {/* ── Action Plan ── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Intervention Strategy</h3>
          <span className="text-[9px] text-blue-500 bg-blue-50 shrink-0 border border-blue-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Actionable</span>
        </div>
        <div className="flex flex-col gap-3">
          {insights.actions.map(a => <ActionCard key={a.priority} action={a} />)}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Geosense AI Engine</p>
      </div>
    </div>
  );
}
