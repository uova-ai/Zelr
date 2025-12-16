"use client";

import React from "react";

interface ZelrPinProps {
  label?: string;
  isSelected?: boolean;
  onClick?: () => void;
  [key: string]: any;
}

/** Turn "200 homes" into "200", "1450 homes" into "1.5K" */
function formatClusterCountFromLabel(label: string): string {
  const match = label.match(/\d+/);
  if (!match) return label;
  const count = parseInt(match[0], 10);
  if (Number.isNaN(count)) return label;

  if (count < 1000) return `${count}`;
  const k = count / 1000;
  if (k < 10) return `${k.toFixed(1)}K`;
  return `${Math.round(k)}K`;
}

/** Turn "$1,249,000" into "1.2M", "$899,900" into "900K" */
function formatPriceLabel(raw: string): string {
  const trimmed = raw.trim();

  // If it's already like 1.2M / 900K, just normalize casing.
  if (/[MK]/i.test(trimmed) && !/homes?/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const digits = trimmed.replace(/[^\d]/g, "");
  const num = parseInt(digits || "0", 10);
  if (!num) return trimmed;

  if (num >= 1_000_000) {
    const m = num / 1_000_000;
    return `${m.toFixed(1)}M`;
  }
  if (num >= 1000) {
    const k = num / 1000;
    return `${Math.round(k)}K`;
  }
  return `${num}`;
}

const ZelrPin: React.FC<ZelrPinProps> = ({ label, isSelected, onClick }) => {
  const rawLabel = String(label ?? "");

  // Heuristic: phrase contains "home"/"homes" → cluster-count pin.
  const isCluster = /homes?/i.test(rawLabel);

  let display = rawLabel;
  if (isCluster) {
    display = formatClusterCountFromLabel(rawLabel);
  } else {
    display = formatPriceLabel(rawLabel);
  }

  const base =
    "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap select-none";

  const clusterStyles =
    "bg-white text-slate-900 border border-slate-300 shadow-sm";

  // Same base look as before, but stronger selected state
  const singleBase =
    "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md border border-white transition-transform duration-150";

  const singleSelected =
    "scale-[1.1] ring-2 ring-sky-400 ring-offset-2 ring-offset-white shadow-xl shadow-sky-400/50 animate-pulse";

  const singleUnselected = "scale-100 hover:scale-[1.03]";

  const singleStyles = [
    singleBase,
    isSelected ? singleSelected : singleUnselected,
  ].join(" ");

  const classes = `${base} ${isCluster ? clusterStyles : singleStyles}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex flex-col items-center gap-0.5 outline-none",
        !isCluster && isSelected ? "translate-y-[-1px]" : "",
      ].join(" ")}
    >
      {/* pill body */}
      <div className={classes}>{display}</div>

      {/* tiny tail so it feels like a map pin, not a floating circle */}
      <div
        className={`h-2 w-[2px] ${
          isCluster
            ? "bg-slate-400"
            : isSelected
            ? "bg-indigo-300"
            : "bg-indigo-600"
        } group-hover:h-3 transition-all duration-150`}
      />
    </button>
  );
};

export default ZelrPin;