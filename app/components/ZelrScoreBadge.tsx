import React from "react";

interface ZelrScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  variant?: "hex" | "pill"; // kept for compatibility
  className?: string;
}

export default function ZelrScoreBadge({
  score,
  size = "sm",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant = "pill",
  className = "",
}: ZelrScoreBadgeProps) {
  const sizeClasses =
    size === "lg"
      ? "text-[13px] px-[14px] py-[6px]"
      : size === "md"
      ? "text-[11px] px-[12px] py-[5px]"
      : "text-[10px] px-[10px] py-[4px]";

  return (
    <div
      className={[
        "inline-flex items-center justify-center select-none",
        "rounded-full border border-slate-700/60",
        "bg-[radial-gradient(circle_at_0%_0%,#38bdf8_0,transparent_55%),radial-gradient(circle_at_130%_140%,#1d4ed8_0,transparent_60%),linear-gradient(145deg,#020617,#020617)]",
        "shadow-[0_6px_16px_rgba(15,23,42,0.85)]",
        "text-slate-100/95 font-semibold tracking-wide",
        "backdrop-blur-[3px]",
        sizeClasses,
        className,
      ].join(" ")}
    >
      <span className="uppercase tracking-[0.22em] text-[0.75em] mr-1.5 opacity-85">
        Zelr
      </span>
      <span className="text-[1.1em] font-semibold text-sky-300">
        {score}
      </span>
    </div>
  );
}