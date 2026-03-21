"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import DottedMap from "dotted-map";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end:   { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

export default function WorldMap({
  dots = [],
  lineColor = "#0ea5e9",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgMap, setSvgMap] = useState<string>("");

  useEffect(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    const svg = map.getSVG({
      radius: 0.22,
      color: "#cbd5e1",   // slate-300 — visible on white, not too dark
      shape: "circle",
      backgroundColor: "transparent",
    });
    setSvgMap(svg);
  }, []);

  const projectPoint = (lat: number, lng: number) => ({
    x: (lng + 180) * (800 / 360),
    y: (90 - lat) * (400 / 180),
  });

  const createCurvedPath = (
    start: { x: number; y: number },
    end:   { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - Math.abs(end.x - start.x) * 0.25;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div className="w-full aspect-[2/1] relative">
      {svgMap && (
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
          }}
          alt="world map"
          draggable={false}
        />
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={lineColor} stopOpacity="0" />
            <stop offset="10%"  stopColor={lineColor} stopOpacity="1" />
            <stop offset="90%"  stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Arc lines */}
        {dots.map((dot, i) => {
          const s = projectPoint(dot.start.lat, dot.start.lng);
          const e = projectPoint(dot.end.lat,   dot.end.lng);
          return (
            <motion.path
              key={`line-${i}`}
              d={createCurvedPath(s, e)}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="1.5"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.8, delay: 0.3 * i, ease: "easeOut" }}
            />
          );
        })}

        {/* City dots */}
        {dots.map((dot, i) => {
          const s = projectPoint(dot.start.lat, dot.start.lng);
          const e = projectPoint(dot.end.lat,   dot.end.lng);
          return (
            <g key={`dots-${i}`}>
              {/* Origin — Ahmedabad */}
              <circle cx={s.x} cy={s.y} r="3" fill={lineColor} filter="url(#glow)" />
              <circle cx={s.x} cy={s.y} r="3" fill={lineColor} opacity="0.5">
                <animate attributeName="r"       from="3"   to="12" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0"  dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Destination */}
              <circle cx={e.x} cy={e.y} r="2" fill={lineColor} opacity="0.8" />
              <circle cx={e.x} cy={e.y} r="2" fill={lineColor} opacity="0.3">
                <animate attributeName="r"       from="2"   to="8" dur="2s" repeatCount="indefinite" begin="0.6s" />
                <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" begin="0.6s" />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}