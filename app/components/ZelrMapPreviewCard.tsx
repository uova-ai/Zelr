"use client";

import { useState } from "react";
import Image from "next/image";
import type { ListingForMap } from "./ZelrMap";

interface Props {
  listing: ListingForMap;
  onClose: () => void;
  onOpenOverlay: () => void;
}

export default function ZelrMapPreviewCard({
  listing,
  onClose,
  onOpenOverlay,
}: Props) {
  const images =
    listing.imageUrls && listing.imageUrls.length > 0
      ? listing.imageUrls
      : [
          "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=80",
        ];

  const [index, setIndex] = useState(0);

  const go = (dir: "prev" | "next") => {
    setIndex((prev) => {
      if (images.length <= 1) return prev;
      if (dir === "prev") return (prev - 1 + images.length) % images.length;
      return (prev + 1) % images.length;
    });
  };

  return (
    <div className="w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/15">
      {/* IMAGE – taller so it dominates the card */}
      <div
        className="relative h-[200px] w-full cursor-pointer"
        onClick={onOpenOverlay}
      >
        <Image
          src={images[index]}
          alt={listing.address}
          fill
          className="object-cover"
        />

        {/* subtle gradient for top text */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        {/* left/right arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go("prev");
              }}
              className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[13px] font-semibold text-slate-800 shadow-md hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go("next");
              }}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[13px] font-semibold text-slate-800 shadow-md hover:bg-white"
            >
              ›
            </button>
          </>
        )}

        {/* top-left beds/baths pill */}
        <div className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-[11px] font-medium text-white">
          {listing.beds} bd · {listing.baths} ba
        </div>

        {/* top-right heart + menu */}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[12px] text-slate-700 shadow-sm hover:bg-white">
            ♡
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[12px] text-slate-700 shadow-sm hover:bg-white">
            …
          </button>
        </div>
      </div>

      {/* TEXT – more like Zillow, stronger hierarchy, tighter */}
      <div className="flex items-start justify-between px-4 py-2">
        <div className="space-y-0.5 leading-snug">
          <div className="text-[12px] font-medium text-slate-900">
            {listing.price}
          </div>
          <div className="text-[11px] text-slate-700">
            {listing.beds} bd · {listing.baths} ba · Home for sale
          </div>
          <div className="text-[11px] text-slate-500">
            {listing.address}
            {listing.city ? `, ${listing.city}` : ""}
          </div>
        </div>

        <button
          onClick={onClose}
          className="ml-3 flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-[11px] text-slate-600 hover:border-slate-400 hover:text-slate-900"
        >
          ✕
        </button>
      </div>

      {/* BOTTOM ROW – compact, single-line CTA pill */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2">
        <span className="text-[10px] text-slate-500">
          Demo preview · Click photo
        </span>
        <button
          onClick={onOpenOverlay}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:from-sky-400 hover:to-indigo-500 whitespace-nowrap"
        >
          <span>Full details</span>
          <span className="text-[13px]">↗</span>
        </button>
      </div>
    </div>
  );
}