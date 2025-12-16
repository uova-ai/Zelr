"use client";

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  FormEvent,
} from "react";
import Image from "next/image";
import ZelrMap, { ListingForMap } from "./components/ZelrMap";
import ListingCard from "./components/ListingCard";
import ZelrScoreHeroBadge from "./components/ZelrScoreHeroBadge";
import ImageCarousel from "./components/ImageCarousel";

type Listing = ListingForMap & {
  tag?: string;
  imageUrls?: string[];
};

/**
 * Base seed listings – we’ll generate many more from these.
 */
const baseListings: Listing[] = [
  {
    id: 1,
    address: "123 King St W",
    city: "Toronto, ON",
    price: "$1,249,000",
    beds: 3,
    baths: 2,
    score: 94,
    lat: 43.6475,
    lng: -79.3832,
    tag: "HOT",
    imageUrls: [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1530518119128-ca0b9d7ef0a6?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    id: 2,
    address: "88 Lakeshore Rd",
    city: "Mississauga, ON",
    price: "$899,900",
    beds: 2,
    baths: 2,
    score: 91,
    tag: "NEW",
    lat: 43.5645,
    lng: -79.5799,
    imageUrls: [
      "https://images.unsplash.com/photo-1600607687920-4e2a534ea583?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    id: 3,
    address: "45 Maple Ave",
    city: "Burlington, ON",
    price: "$1,029,000",
    beds: 4,
    baths: 3,
    score: 89,
    lat: 43.3255,
    lng: -79.8015,
    imageUrls: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    id: 4,
    address: "10 Bayview Dr",
    city: "Hamilton, ON",
    price: "$749,000",
    beds: 3,
    baths: 2,
    score: 87,
    lat: 43.2505,
    lng: -79.8663,
    imageUrls: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1512914890250-353c97c9e7e2?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1600&q=80",
    ],
  },
];

/**
 * Demo location options for the search bar (we’ll later plug in real
 * Places / MLS data). These drive the map center + zoom.
 */
type CityOption = {
  label: string;
  lat: number;
  lng: number;
  zoom: number;
};

const CITY_OPTIONS: CityOption[] = [
  { label: "Toronto, ON", lat: 43.6532, lng: -79.3832, zoom: 11 },
  { label: "Mississauga, ON", lat: 43.589, lng: -79.6441, zoom: 11 },
  { label: "Hamilton, ON", lat: 43.2557, lng: -79.8711, zoom: 11 },
  { label: "Burlington, ON", lat: 43.3255, lng: -79.799, zoom: 11 },
  { label: "Oakville, ON", lat: 43.4675, lng: -79.6877, zoom: 11 },
  { label: "London, ON", lat: 42.9849, lng: -81.2453, zoom: 11 },
];

/**
 * Utility: parse "$1,249,000" -> 1249000
 */
function parsePrice(priceStr: string): number {
  const digits = priceStr.replace(/[^\d]/g, "");
  const num = parseInt(digits || "0", 10);
  return Number.isNaN(num) ? 0 : num;
}

function clampScore(x: number): number {
  return Math.max(0, Math.min(100, x));
}

/**
 * Generate a TON of listings from the base ones so the page feels real.
 * For now we generate, then compute city price stats, then assign an
 * official Zelr Score using our 70/15/10/5 model.
 */
const MULTIPLIER = 200; // 4 * 200 = 800 listings

const generatedListings: Listing[] = Array.from(
  { length: baseListings.length * MULTIPLIER },
  (_, i) => {
    const template = baseListings[i % baseListings.length];
    const id = i + 1;

    const priceNumber = parsePrice(template.price);
    const priceDelta = (i % 40) * 3500; // small variation
    const newPrice = priceNumber + priceDelta;

    const latJitter = ((i % 15) - 7) * 0.0006;
    const lngJitter = (((i * 7) % 15) - 7) * 0.0006;

    const unitSuffix = 100 + (i % 900);

    // score will be recomputed below using the real Zelr model
    return {
      ...template,
      id,
      address: `${template.address} #${unitSuffix}`,
      price: `$${newPrice.toLocaleString()}`,
      score: 0,
      lat: template.lat + latJitter,
      lng: template.lng + lngJitter,
    };
  }
);

// City price stats for "Value vs Local Market"
type CityPriceStats = {
  [city: string]: {
    avgPrice: number;
  };
};

const cityPriceStats: CityPriceStats = (() => {
  const sums: Record<string, { total: number; count: number }> = {};
  for (const l of generatedListings) {
    const price = parsePrice(l.price);
    if (!price) continue;
    const cityKey = l.city || "Unknown";
    if (!sums[cityKey]) {
      sums[cityKey] = { total: 0, count: 0 };
    }
    sums[cityKey].total += price;
    sums[cityKey].count += 1;
  }

  const result: CityPriceStats = {};
  for (const city in sums) {
    const { total, count } = sums[city];
    result[city] = {
      avgPrice: count > 0 ? total / count : 0,
    };
  }
  return result;
})();

/**
 * Official Zelr Score (0–100)
 *  - 70% Value vs Local Market
 *  - 15% Fundamentals (beds/baths for now)
 *  - 10% Location (city baseline)
 *  - 5%  Momentum (HOT/NEW)
 *
 * Includes caps/penalties so:
 *  - clearly overpriced homes never score like elite deals
 *  - micro-units can't hit 95 just because they're cheap
 */
function computeZelrScore(listing: Listing): number {
  const price = parsePrice(listing.price);
  const cityStats = cityPriceStats[listing.city] ?? null;
  const localAvg = cityStats?.avgPrice && cityStats.avgPrice > 0 ? cityStats.avgPrice : price || 1;
  const ratio = price / localAvg; // >1 = overpriced, <1 = underpriced

  // 1) VALUE vs LOCAL MARKET (70%)
  let valueComponent: number;
  if (ratio <= 0.85) {
    // 15%+ under local avg → elite deal
    valueComponent = 98;
  } else if (ratio <= 0.95) {
    // 5–15% under local avg → strong value
    const t = (ratio - 0.85) / 0.1; // 0..1
    valueComponent = 95 - t * 5; // 95 → 90
  } else if (ratio <= 1.05) {
    // within ±5% → fair
    const t = (ratio - 0.95) / 0.1;
    valueComponent = 90 - t * 20; // 90 → 70
  } else if (ratio <= 1.20) {
    // 5–20% overpriced → mediocre
    const t = (ratio - 1.05) / 0.15;
    valueComponent = 70 - t * 20; // 70 → 50
  } else {
    // 20%+ overpriced → bad deal
    valueComponent = 45;
  }

  // 2) FUNDAMENTALS (15%) – beds + baths approximation
  const beds = listing.beds;
  const baths = listing.baths;

  // Rough size-based score; we cap at 100.
  const baseSizeScore = Math.min(beds * 15 + baths * 10, 100);
  let fundamentalsBase = baseSizeScore;

  // Tiny unit cap for fundamentals
  const isMicro = beds <= 1 && baths <= 1;
  if (isMicro) {
    fundamentalsBase = Math.min(fundamentalsBase, 70);
  }

  // 3) LOCATION (10%) – simple GTA bias for now
  const cityLower = listing.city.toLowerCase();
  let locationBase = 75;
  if (cityLower.includes("toronto")) locationBase = 90;
  else if (
    cityLower.includes("mississauga") ||
    cityLower.includes("oakville") ||
    cityLower.includes("burlington")
  ) {
    locationBase = 85;
  } else if (cityLower.includes("hamilton")) {
    locationBase = 80;
  } else if (cityLower.includes("london")) {
    locationBase = 78;
  }

  // 4) MOMENTUM (5%) – HOT/NEW tag
  let momentumBase = 60;
  if (listing.tag === "HOT") momentumBase = 95;
  else if (listing.tag === "NEW") momentumBase = 85;

  // Combine with weights: 70 / 15 / 10 / 5
  let score =
    valueComponent * 0.7 +
    fundamentalsBase * 0.15 +
    locationBase * 0.1 +
    momentumBase * 0.05;

  // Caps / penalties (protection rules)

  // Very overpriced → hard cap
  if (ratio > 1.25) {
    score = Math.min(score, 60);
  } else if (ratio > 1.15) {
    score = Math.min(score, 70);
  }

  // Micro properties can never look like elite 98s
  if (isMicro) {
    score = Math.min(score, 85);
  }

  return Math.round(clampScore(score));
}

// Final listings with official Zelr Score applied
const listings: Listing[] = generatedListings.map((l) => ({
  ...l,
  score: computeZelrScore(l),
}));

export default function HomePage() {
const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  // ✅ Visible listings based on map bounds (default = all)
  const [visibleListings, setVisibleListings] = useState<Listing[]>(listings);

  // 🔍 Search bar state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchTarget, setSearchTarget] = useState<{
    center: { lat: number; lng: number };
    zoom: number;
  } | null>(null);

  // Suggestions: if no query, show a small default list
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return CITY_OPTIONS.slice(0, 5);
    }
    const q = searchQuery.toLowerCase();
    return CITY_OPTIONS.filter((opt) =>
      opt.label.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  // pagination: 40 per page
  const [page, setPage] = useState(1);
  const perPage = 40;
  const totalPages = Math.max(
    1,
    Math.ceil(visibleListings.length / perPage)
  );
  const startIndex = (page - 1) * perPage;
  const paginatedListings = visibleListings.slice(
    startIndex,
    startIndex + perPage
  );

const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  const detailListing = listings.find((l) => l.id === detailId) ?? null;

  // When you change page, scroll the listings container back to top
  useEffect(() => {
    if (listContainerRef.current) {
      listContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page]);

  useEffect(() => {
    if (selectedId == null) return;
    const el = cardRefs.current[selectedId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedId, page]);

  // whenever you open a new listing overlay, reset the score panel
  useEffect(() => {
    if (detailId != null) setShowScoreDetails(false);
  }, [detailId]);

  // ✅ Reset to page 1 when visible listings change (map moved)
  useEffect(() => {
    setPage(1);
  }, [visibleListings]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  // helper to render Zillow-style pagination: 1 2 3 4 5 … 20
  const buildPageList = () => {
    const pages: (number | "...")[] = [];
    const maxShown = 5;

    if (totalPages <= maxShown + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const current = page;

    pages.push(1);
    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  // ✅ Handler for map bounds → filter listings
  const handleBoundsChange = (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    const { north, south, east, west } = bounds;

    const filtered = listings.filter((l) => {
      return (
        l.lat <= north &&
        l.lat >= south &&
        l.lng <= east &&
        l.lng >= west
      );
    });

    setVisibleListings(filtered);
  };

  // 🔍 When user picks a location suggestion
  const handleSelectLocation = (option: CityOption) => {
    setSearchQuery(option.label);
    setSearchTarget({
      center: { lat: option.lat, lng: option.lng },
      zoom: option.zoom,
    });
    setSearchFocused(false);
  };

  // 🔍 When user hits Enter in the search bar
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.toLowerCase();
    const exact =
      CITY_OPTIONS.find(
        (opt) => opt.label.toLowerCase() === q
      ) ?? null;
    const partial =
      CITY_OPTIONS.find((opt) =>
        opt.label.toLowerCase().includes(q)
      ) ?? null;

    const match = exact ?? partial;
    if (match) {
      handleSelectLocation(match);
    } else {
      // no known city match – clear target for now
      setSearchTarget(null);
      setSearchFocused(false);
    }
  };

  return (
    <main className="relative flex h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Top nav */}
      <header className="z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand with logo + Zelr text */}
          <div className="flex items-center -space-x-1">
            <Image
              src="/zelr-logo.png"
              alt="Zelr logo"
              width={50}
              height={50}
              className="object-contain"
              priority
            />
            <span className="text-[20px] font-semibold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent tracking-tight">
              Zelr
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden gap-8 text-[14px] font-medium text-slate-700 sm:flex">
            <button className="text-slate-900">Buy</button>
            <button className="hover:text-slate-900">Rent</button>
            <button className="hover:text-slate-900">Sell</button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="hidden items-center rounded-full bg-gradient-to-r from-sky-600 to-indigo-700 px-4 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:from-sky-500 hover:to-indigo-600 hover:shadow-md sm:inline-flex">
              Premium
            </button>
            <button className="rounded-full border border-slate-300 px-3 py-1.5 text-[13px] font-medium text-slate-800 hover:border-slate-400 hover:text-slate-900">
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* Map + listings split */}
      <section className="flex h-[calc(100vh-4rem)] flex-1 overflow-hidden">
        {/* LEFT: map */}
  <div className="relative hidden h-full flex-[0.64] min-w-[480px] border-r border-slate-200 bg-slate-50 px-4 py-3 sm:block">
  <div className="h-full w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <ZelrMap
              listings={visibleListings}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(Number(id))}
              onOpenOverlay={(id) => setDetailId(Number(id))}
              onBoundsChange={handleBoundsChange}
              searchTarget={searchTarget}
            />
          </div>
        </div>

        {/* RIGHT: listings */}
        <div className="flex flex-1 flex-col bg-slate-50">
          {/* Search + sort */}
          <div className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-sm sm:px-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-3">
              {/* Row 1: title + count on left, filter pills on right */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1">
                  <h1 className="text-[15px] font-semibold text-slate-900">
                    Homes
                  </h1>
                  <span className="text-[13px] text-slate-600">
                    {visibleListings.length} homes for sale in this area
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-800 hover:border-sky-500 hover:text-sky-600">
                    For sale
                  </button>
                  <button className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-700 hover:border-sky-500 hover:text-sky-600">
                    Price
                  </button>
                  <button className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-700 hover:border-sky-500 hover:text-sky-600">
                    Beds &amp; baths
                  </button>
                  <button className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-700 hover:border-sky-500 hover:text-sky-600">
                    Home type
                  </button>
                  <button className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-700 hover:border-sky-500 hover:text-sky-600">
                    More filters
                  </button>
                </div>
              </div>

              {/* Row 2: wide search bar + ranked-by select aligned to the right */}
              <form
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
                onSubmit={handleSearchSubmit}
              >
                <div className="relative w-full flex-1">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Search by city, address, MLS ID..."
                    className="h-9 w-full flex-1 rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
                  />

                  {/* Suggestions dropdown */}
                  {searchFocused && suggestions.length > 0 && (
                    <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
                      {suggestions.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleSelectLocation(opt)}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-slate-50"
                        >
                          <span className="text-slate-800">{opt.label}</span>
                          <span className="text-[11px] text-slate-400">
                            City
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <select className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[13px] text-slate-800 focus:border-sky-500 focus:outline-none sm:w-56">
                  <option>Ranked by Zelr Score</option>
                  <option>Highest price</option>
                  <option>Lowest price</option>
                  <option>Newest</option>
                </select>
              </form>
            </div>
          </div>

          {/* Cards grid */}
          <div
            ref={listContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 sm:px-6"
          >
            <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {paginatedListings.map((listing) => (
                <div
                  key={listing.id}
                  ref={(el) => {
cardRefs.current[String(listing.id)] = el;
                  }}
                >
                  <ListingCard
                    listing={{
                      ...listing,
                      image: listing.imageUrls?.[0] ?? "",
                      zelrScore: listing.score,
                    }}
                    isSelected={selectedId === listing.id}
                    onClick={() => {
                      setSelectedId(listing.id as number);
                      setDetailId(listing.id as number);
                    }}
                  />
                </div>
              ))}
            </div>

            {visibleListings.length === 0 && (
              <div className="mx-auto mt-6 flex max-w-5xl items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-6 text-[13px] text-slate-500">
                No homes in this area. Try moving the map or zooming out.
              </div>
            )}

            {/* Pagination + footer */}
            <div className="mx-auto mt-6 flex max-w-5xl flex-col items-center gap-3 border-t border-slate-200 pt-4 pb-6">
              {/* pagination row */}
              {visibleListings.length > 0 && (
                <div className="flex items-center gap-2 text-[12px]">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className={`rounded-full px-3 py-1 border text-[12px] ${
                      page === 1
                        ? "border-slate-200 text-slate-300 cursor-default"
                        : "border-slate-300 text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    Prev
                  </button>

                  {buildPageList().map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`dots-${idx}`}
                        className="px-1 text-slate-400"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p as number)}
                        className={`h-8 w-8 rounded-full text-[12px] ${
                          page === p
                            ? "bg-sky-600 text-white font-semibold"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-sky-500"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className={`rounded-full px-3 py-1 border text-[12px] ${
                      page === totalPages
                        ? "border-slate-200 text-slate-300 cursor-default"
                        : "border-slate-300 text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Bottom brand row like Zillow footer strip */}
              <div className="flex flex-col items-center gap-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <Image
                    src="/zelr-logo.png"
                    alt="Zelr"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>Follow us on Instagram:</span>
                  <a
                    href="https://instagram.com/zelrhomes"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-sky-600 hover:text-sky-500"
                  >
                    @zelrhomes
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAIL OVERLAY */}
      {detailListing && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDetailId(null)}
        >
          <div
            className="mt-10 mb-6 w-full max-w-6xl max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-400/40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setDetailId(null)}
                  className="text-[13px] font-medium text-slate-600 hover:text-slate-900"
                >
                  ← Back to results
                </button>

                <div className="flex items-center -space-x-1 scale-[1.4] origin-center">
                  <Image
                    src="/zelr-logo.png"
                    alt="Zelr logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                  <span className="text-[17px] font-semibold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent tracking-tight">
                    Zelr
                  </span>
                </div>

                <button
                  onClick={() => setDetailId(null)}
                  className="rounded-full border border-slate-300 px-2.5 py-1 text-[12px] text-slate-700 hover:border-slate-400 hover:text-slate-900"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Premium tools bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-3">
              <span className="text-[12px] uppercase tracking-[0.16em] text-slate-500">
                Premium tools
              </span>
              <div className="flex flex-wrap gap-2 text-[12px]">
                {["X-Ray mode", "OfferWriter AI", "Market forecast"].map(
                  (label) => (
                    <button
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[12px] shadow-[0_0_0_1px_rgba(15,23,42,0.03)] hover:shadow-md hover:border-slate-300 transition"
                    >
                      <span className="uppercase tracking-[0.16em] font-semibold text-sky-700">
                        PREMIUM
                      </span>
                      <span className="text-slate-700">{label}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-5 p-5 pb-7">
              {/* gallery – main photo now scrollable */}
              <div className="grid gap-3 lg:grid-cols-[2fr,1fr]">
                {/* main photo carousel */}
                <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <ImageCarousel
                    images={
                      detailListing.imageUrls?.length
                        ? detailListing.imageUrls
                        : [
                            "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=80",
                          ]
                    }
                    aspect="wide"
                  />
                  <button className="absolute bottom-3 right-3 rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-[12px] font-medium text-slate-800 backdrop-blur hover:bg-white">
                    See all photos (demo)
                  </button>
                </div>

                {/* side photos (2–4) */}
                <div className="flex h-[380px] flex-col gap-3">
                  {(detailListing.imageUrls ?? [])
                    .slice(1, 4)
                    .map((url, idx) => (
                      <div
                        key={idx}
                        className="relative flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                      >
                        <Image
                          src={url}
                          alt={`${detailListing.address} photo ${idx + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}

                  {(!detailListing.imageUrls ||
                    detailListing.imageUrls.length < 2) && (
                    <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-[13px] text-slate-400">
                      More photos coming soon
                    </div>
                  )}
                </div>
              </div>

              {/* price + key stats */}
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
                {/* LEFT: price + basic details */}
                <div className="space-y-1 lg:w-1/3">
                  <div className="text-[26px] font-semibold text-slate-900">
                    {detailListing.price}
                  </div>
                  <div className="text-[15px] text-slate-700">
                    {detailListing.beds} beds · {detailListing.baths} baths
                  </div>
                  <div className="text-[13px] text-slate-600">
                    {detailListing.address}
                    {detailListing.city ? `, ${detailListing.city}` : ""}
                  </div>
                </div>

                {/* CENTER: hero Zelr score badge */}
                <div className="flex justify-center lg:w-1/3">
                  <button
                    type="button"
                    onClick={() => setShowScoreDetails((prev) => !prev)}
                    className="inline-flex items-center justify-center"
                  >
                    <ZelrScoreHeroBadge
                      score={detailListing.score}
                    
                    />
                  </button>
                </div>

                {/* RIGHT: CTA + optional score details */}
                <div className="flex w-full flex-col items-end gap-3 lg:w-1/3">
                  <button className="rounded-full bg-emerald-500 px-4 py-2 text-[13px] font-semibold text-emerald-950 shadow-sm hover:bg-emerald-400 lg:whitespace-nowrap">
                    Request a tour (coming soon)
                  </button>

                  {showScoreDetails && (
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[12px] text-slate-700 shadow-sm">
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Why this Zelr Score (demo)
                      </div>
                      <ul className="space-y-1">
                        <li>
                          <span className="font-medium">Price vs area:</span>{" "}
                          Fair compared to similar homes nearby.
                        </li>
                        <li>
                          <span className="font-medium">Maintenance risk:</span>{" "}
                          Medium – typical age roof, windows &amp; HVAC.
                        </li>
                        <li>
                          <span className="font-medium">
                            Neighborhood trend:
                          </span>{" "}
                          Stable prices with steady demand.
                        </li>
                        <li>
                          <span className="font-medium">Zelr estimate:</span>{" "}
                          AI-blended view of risk, upside and location.
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* key facts strip */}
              <section className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[13px] text-slate-800 md:grid-cols-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    Type
                  </div>
                  <div className="mt-1 font-medium">Single-family</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    Year built
                  </div>
                  <div className="mt-1 font-medium">2008 (placeholder)</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    Lot size
                  </div>
                  <div className="mt-1 font-medium">4,200 sq ft (demo)</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    Interior
                  </div>
                  <div className="mt-1 font-medium">~1,800 sq ft (demo)</div>
                </div>
              </section>

              {/* what's special */}
              <section className="space-y-3">
                <h2 className="text-[15px] font-semibold text-slate-900">
                  What&apos;s special about this home
                </h2>
                <div className="flex flex-wrap gap-2 text-[12px]">
                  {[
                    "Newer roof",
                    "Updated kitchen",
                    "Quiet street",
                    "Natural light",
                    "Finished basement",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-[13px] leading-relaxed text-slate-700">
                  This is placeholder copy for Zelr. In the real product, this
                  section will be auto-written by AI from the listing
                  description, highlighting the 3–5 things that actually matter
                  to buyers.
                </p>
              </section>

              {/* Zelr Insights */}
              <section className="space-y-3">
                <h2 className="text-[15px] font-semibold text-slate-900">
                  Zelr Insights (demo)
                </h2>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-900">
                    <div className="text-[11px] uppercase tracking-[0.16em] opacity-80">
                      Projected growth
                    </div>
                    <div className="mt-2 text-[20px] font-semibold">
                      +12–18% · 3 years
                    </div>
                    <p className="mt-1">
                      Based on similar sales, school quality, and local demand.
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-900">
                    <div className="text-[11px] uppercase tracking-[0.16em] opacity-80">
                      Maintenance risk
                    </div>
                    <div className="mt-2 text-[20px] font-semibold">Medium</div>
                    <p className="mt-1">
                      Age of roof, windows, HVAC and plumbing would roll into a
                      simple 0–100 risk score.
                    </p>
                  </div>
                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-[13px] text-sky-900">
                    <div className="text-[11px] uppercase tracking-[0.16em] opacity-80">
                      Neighborhood pulse
                    </div>
                    <div className="mt-2 text-[20px] font-semibold">
                      Calm · Family focused
                    </div>
                    <p className="mt-1">
                      Walkability, transit, and price trends summarized in one
                      simple line.
                    </p>
                  </div>
                </div>
              </section>

              {/* mini map + contact */}
              <section className="grid gap-4 md:grid-cols-[3fr,2fr]">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[13px] text-slate-700">
                  <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    Location snapshot
                  </div>
                  <div className="relative h-40 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <div className="absolute inset-0 flex items-center justify-center text-[13px] text-slate-400">
                      Mini map preview (coming soon)
                    </div>
                  </div>
                  <p className="mt-2 text-[12px] text-slate-600">
                    In the live Zelr app this will show nearby prices, schools
                    and commute times using the same map engine as the main
                    search.
                  </p>
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 text-[13px] text-slate-700">
                  <div className="text-[15px] font-semibold text-slate-900">
                    Ready to move on this home?
                  </div>
                  <p className="text-[13px] text-slate-600">
                    Soon you&apos;ll be able to request a tour, match with a top
                    local agent, or start an offer directly through Zelr.
                  </p>
                  <button className="mt-1 rounded-full bg-emerald-500 px-4 py-2 text-[13px] font-semibold text-emerald-950 hover:bg-emerald-400">
                    Contact agent (coming soon)
                  </button>
                  <p className="mt-1 text-[11px] text-slate-500">
                    No spam. No junk leads. Zelr connects you with one vetted
                    professional instead of blasting your info to dozens of
                    agents.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}