import React, { useState } from 'react';
import { generateReport } from '@/lib/api';

export default function ReportDownload({ city }: { city: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await generateReport(city);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${city}_SatEye_Action_Plan.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to download report', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`relative group px-6 py-3 rounded-xl font-bold text-white transition-all overflow-hidden ${
        loading ? 'cursor-wait bg-slate-800' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
      }`}
    >
      <div className="flex items-center gap-2 relative z-10">
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="animate-pulse">Generating Plan...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Download Action Plan PDF</span>
          </>
        )}
      </div>
      {!loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
    </button>
  );
}