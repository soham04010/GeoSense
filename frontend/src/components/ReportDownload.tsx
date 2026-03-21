// frontend/components/ReportDownload.tsx
"use client";

import { useState } from "react";
import { downloadActionPlan } from "@/lib/api";

export default function ReportDownload({ city }: { city: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const blob = await downloadActionPlan(city);
      
      // Create a fake link in the browser to trigger the file download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${city}_Environment_Action_Plan.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      alert("Failed to generate PDF. Make sure the backend ML script is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={loading}
      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white font-bold rounded-lg shadow-lg transition-all"
    >
      {loading ? "Generating Report..." : "📥 Download Action Plan (PDF)"}
    </button>
  );
}