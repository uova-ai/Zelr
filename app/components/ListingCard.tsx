"use client";

import { useState, MouseEvent } from "react";
import ImageCarousel from "./ImageCarousel";
import ZelrScoreBadge from "./ZelrScoreBadge";

interface ListingCardProps {
  listing: any;
  isSelected: boolean;
  onClick: () => void;
}

// Map a numeric score to a simple value verdict
function getValueLabel(score: number): string {
  if (score >= 93) return "Elite value";
  if (score >= 86) return "Prime value";
  if (score >= 78) return "Good value";
  if (score >= 70) return "Fair value";
  return "Overpriced risk";
}

export default function ListingCard({
  listing,
  isSelected,
  onClick,
}: ListingCardProps) {
  const [liked, setLiked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const score: number = listing.zelrScore ?? listing.score ?? 82;
  const valueLabel = getValueLabel(score);

  const imageUrls: string[] =
    listing.imageUrls && listing.imageUrls.length > 0
      ? listing.imageUrls
      : [
          listing.image ??
            "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=80",
        ];

  // Helpers so card click doesn't fire when using heart / menu
  const stopCardClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const beds = listing.beds ?? "--";
  const baths = listing.baths ?? "--";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left rounded-2xl border overflow-hidden transition-all",
        "bg-white border-slate-200 hover:bg-slate-50 hover:border-sky-400/70",
        "shadow-sm hover:shadow-xl hover:shadow-sky-500/10",
        isSelected ? "border-sky-400 ring-1 ring-sky-300/60" : "",
      ].join(" ")}
    >
      {/* TOP: photo with carousel */}
      <div className="relative w-full aspect-[4/3] border-b border-slate-200 bg-slate-100 overflow-hidden">
        {/* Carousel */}
        <ImageCarousel images={imageUrls} aspect="wide" rounded={false} />

        {/* Top-left: heart (save) */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <div
            onClick={(e) => {
              stopCardClick(e);
              setLiked((prev) => !prev);
              setMenuOpen(false);
            }}
            className={[
              "flex h-8 w-8 items-center justify-center rounded-full",
              "bg-white/90 shadow-sm border border-slate-200",
              "hover:bg-white hover:shadow-md transition",
              liked ? "text-rose-500 border-rose-200" : "text-slate-500",
            ].join(" ")}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.7}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4 8.24 4 9.91 4.81 11 6.09 12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          {/* Listing tag (HOT / NEW) just below heart */}
          {listing.tag && (
            <span className="rounded-full bg-emerald-500 px-2.5 py-[3px] text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
              {listing.tag}
            </span>
          )}
        </div>

        {/* Top-right: three-dots menu */}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          <div
            onClick={(e) => {
              stopCardClick(e);
              setMenuOpen((prev) => !prev);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-slate-200 text-slate-600 shadow-sm hover:bg-white hover:shadow-md hover:border-slate-300 transition"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="currentColor"
            >
              <circle cx="5" cy="12" r="1.4" />
              <circle cx="12" cy="12" r="1.4" />
              <circle cx="19" cy="12" r="1.4" />
            </svg>
          </div>

          {menuOpen && (
            <div
              onClick={stopCardClick}
              className="mt-1 w-40 rounded-xl border border-slate-200 bg-white/95 py-1 text-[11px] text-slate-700 shadow-lg shadow-slate-900/10"
            >
              <button
                className="block w-full px-3 py-1.5 text-left hover:bg-slate-50"
                onClick={(e) => {
                  stopCardClick(e);
                  setMenuOpen(false);
                }}
              >
                Share listing
              </button>
              <button
                className="block w-full px-3 py-1.5 text-left hover:bg-slate-50"
                onClick={(e) => {
                  stopCardClick(e);
                  setMenuOpen(false);
                }}
              >
                Hide this listing
              </button>
              <button
                className="block w-full px-3 py-1.5 text-left text-rose-500 hover:bg-rose-50"
                onClick={(e) => {
                  stopCardClick(e);
                  setMenuOpen(false);
                }}
              >
                Report issue
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM: details – stronger like Zillow */}
      <div className="flex flex-col gap-2 px-3 pb-3 pt-2.5 sm:px-4 sm:pb-3.5">
        {/* Price + score */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* Price – bigger & darker */}
            <p className="text-[17px] sm:text-[18px] font-semibold tracking-tight text-slate-900">
              {listing.price}
            </p>

            {/* Line like “3 bd | 2 ba · House for sale” */}
            <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[12px] sm:text-[13px] text-slate-800">
              <span>
                {beds} bd <span className="text-slate-400">|</span> {baths} ba
              </span>
              <span className="text-slate-300">·</span>
              <span>House for sale</span>
            </div>

            {/* Address line */}
            <div className="mt-0.5 truncate text-[12px] sm:text-[13px] text-slate-700">
              {listing.address}
              {listing.city ? `, ${listing.city}` : ""}
            </div>

            {/* Small listing source (demo text) */}
            <div className="mt-0.5 text-[11px] text-slate-400">
              Listing by Zelr · Demo data
            </div>
          </div>

          {/* Zelr Score badge + one-line verdict */}
          <div className="shrink-0 flex flex-col items-end gap-0.5">
            <ZelrScoreBadge score={score} size="sm" />
            <span className="text-[10px] font-medium text-slate-600">
              {valueLabel}
            </span>
          </div>
        </div>

        {/* BOTTOM BUTTONS – Book showing + Contact agent */}
        <div className="mt-2 flex items-center justify-between gap-2">
          {/* Book Showing */}
          <span
            className="
              rounded-full bg-blue-600 text-white 
              px-3.5 py-1.5 text-[11px] sm:text-[12px] 
              font-semibold shadow-sm hover:bg-blue-700 transition
            "
          >
            Book showing
          </span>

          {/* Contact Agent */}
          <span
            className="
              rounded-full border border-slate-300 bg-white text-slate-800 
              px-3.5 py-1.5 text-[11px] sm:text-[12px] 
              font-semibold shadow-sm hover:bg-slate-100 transition
            "
          >
            Contact agent
          </span>
        </div>
      </div>
    </button>
  );
}