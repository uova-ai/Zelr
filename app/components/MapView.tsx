"use client";

import { useEffect, useRef } from "react";
import type { Listing } from "../../lib/data/listings";

type Bounds = { west: number; east: number; south: number; north: number };

export default function MapView({
  bounds, listings, onSelect, theme = "dark",
}: {
  bounds: Bounds;
  listings: Listing[];
  onSelect: (id: string) => void;
  theme?: "dark" | "light";
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const project = (lat: number, lng: number, w: number, h: number) => {
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * w;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * h;
    return { x, y };
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => el.style.setProperty("--ts", String(Date.now())));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bg =
    theme === "dark"
      ? "bg-[radial-gradient(800px_400px_at_30%_20%,rgba(0,180,255,0.15),transparent)]"
      : "bg-[radial-gradient(800px_400px_at_30%_20%,rgba(0,90,255,0.05),transparent)]";

  return (
    <div ref={ref} className={`relative h-full w-full ${bg}`}>
      <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3af" /><stop offset="100%" stopColor="#6bf" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#g)" opacity="0.06" />
      </svg>

      {listings.map((l) => {
        const r = ref.current?.getBoundingClientRect();
        const w = r?.width ?? 1;
        const h = r?.height ?? 1;
        const { x, y } = project(l.lat, l.lng, w, h);
        return (
          <button
            key={l.id}
            className="absolute -translate-x-1/2 -translate-y-full rounded-full border border-white/20 bg-black/70 px-2.5 py-1 text-xs text-white shadow-md hover:bg-black/85"
            style={{ left: x, top: y }}
            onClick={() => onSelect(l.id)}
            title={`C$${l.price.toLocaleString()}`}
          >
            C${l.price.toLocaleString()}
          </button>
        );
      })}
    </div>
  );
}