"use client";

import { useEffect, useState } from "react";

interface ZelrIndexBadgeProps {
  score?: number; // 0–100
  tier?: "Prime" | "Elevated" | "Standard";
}

export default function ZelrIndexBadge({
  score = 94,
  tier = "Prime",
}: ZelrIndexBadgeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [fill, setFill] = useState(0);
  const [liveVisible, setLiveVisible] = useState(false);

  useEffect(() => {
    const target = Math.max(0, Math.min(score, 100));
    const duration = 900; // ms

    const start = performance.now();

    const frame = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      setDisplayScore(Math.round(target * eased));
      setFill(target * eased);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setLiveVisible(true);
      }
    };

    requestAnimationFrame(frame);
  }, [score]);

  const fillWidth = `${fill}%`;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* subtle glow underneath */}
      <div className="pointer-events-none absolute inset-x-8 -bottom-3 h-4 rounded-full bg-sky-500/15 blur-xl" />

      {/* main pill */}
      <div className="relative flex w-[420px] max-w-full flex-col gap-2 rounded-full border border-slate-200/80 bg-white/85 px-7 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        {/* top row */}
        <div className="flex items-center justify-between gap-4">
          {/* score */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold tracking-tight text-slate-900">
              {displayScore}
            </span>
            <span className="text-xs font-medium text-slate-400">/100</span>
          </div>

          {/* center label */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
              <span>ZELR INDEX</span>
              <span
                className={`flex items-center gap-1 transition-opacity duration-300 ${
                  liveVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.28)]" />
                <span className="text-[10px] font-semibold text-emerald-500">
                  Live
                </span>
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              Price • Risk • Neighborhood
            </div>
          </div>

          {/* tier pill */}
          <div className="flex flex-col items-end gap-1">
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{tier.toUpperCase()}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400">
              {displayScore}/100
            </span>
          </div>
        </div>

        {/* bar */}
        <div className="mt-1 flex flex-col gap-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 transition-[width] duration-500 ease-out"
              style={{ width: fillWidth }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-medium text-slate-400">
            <span>Zelr valuation score</span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}