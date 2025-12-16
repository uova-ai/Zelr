"use client";

import { useMemo, useState, useRef } from "react";

/** --- minimal mock data so the page renders nicely --- */
type Listing = {
  id: string;
  price: number;
  beds: number;
  baths: number;
  type: "house" | "condo" | "townhouse" | "semi";
  address: string;
  lat: number;
  lng: number;
  views: number;
  score: number;
};

const mockListings: Listing[] = (() => {
  const out: Listing[] = [];
  let r = 1337;
  const rand = () => (r = (r * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const types = ["house", "condo", "townhouse", "semi"] as const;
  for (let i = 0; i < 60; i++) {
    const lat = 43.55 + rand() * 0.45;
    const lng = -79.9 + rand() * 0.9;
    const price = Math.floor(450_000 + rand() * 1_600_000);
    const beds = 1 + Math.floor(rand() * 5);
    const baths = 1 + Math.floor(rand() * 4);
    const type = types[Math.floor(rand() * types.length)];
    const views = Math.floor(rand() * 120);
    const score = Math.floor(55 + rand() * 45);
    out.push({
      id: `l${i}`,
      price,
      beds,
      baths,
      type,
      views,
      score,
      address: `${100 + Math.floor(rand() * 900)} Example St, Toronto, ON`,
      lat,
      lng,
    });
  }
  return out;
})();
/** ----------------------------------------------------- */

export default function ListingPageClient() {
  // simple filters (top chips)
  const [q, setQ] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [type, setType] = useState("");

  const results = useMemo(() => {
    const m = min ? Number(min) : 0;
    const M = max ? Number(max) : Number.MAX_SAFE_INTEGER;
    const b = beds ? Number(beds) : 0;
    const ba = baths ? Number(baths) : 0;
    const needle = q.trim().toLowerCase();
    return mockListings.filter(
      (l) =>
        l.price >= m &&
        l.price <= M &&
        l.beds >= b &&
        l.baths >= ba &&
        (!type || l.type === type) &&
        (!needle || l.address.toLowerCase().includes(needle))
    );
  }, [q, min, max, beds, baths, type]);

  const chip =
    "rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10";

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0b0f17] text-white">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0f17]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 text-black">
              Z
            </span>
            <span>Zelr.ca</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <a className="text-white/80 hover:text-white" href="#">Buy</a>
            <a className="text-white/80 hover:text-white" href="#">Rent</a>
            <a className="text-white/80 hover:text-white" href="#">Sell</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10">
              Sign in
            </button>
            <button className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10">
              •••
            </button>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="mx-auto max-w-7xl px-4 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-96">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="City, neighborhood, address, MLS® #"
                className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-cyan-400/50"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                ⌕
              </span>
            </div>
            <input
              value={min}
              onChange={(e) => setMin(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Min"
              className="w-[88px] rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-cyan-400/40"
              inputMode="numeric"
            />
            <input
              value={max}
              onChange={(e) => setMax(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Max"
              className="w-[88px] rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-cyan-400/40"
              inputMode="numeric"
            />
            <select className={chip} value={beds} onChange={(e) => setBeds(e.target.value)}>
              <option value="">Beds</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
            <select className={chip} value={baths} onChange={(e) => setBaths(e.target.value)}>
              <option value="">Baths</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
            <select className={chip} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Home type</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="semi">Semi-detached</option>
            </select>
            <button className="rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-medium text-black">
              Save search
            </button>
          </div>
        </div>
      </header>

      {/* SPLIT */}
      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 md:grid-cols-[1.15fr_1fr]">
        {/* MAP LEFT */}
        <section className="relative hidden h-[calc(100vh-128px)] border-r border-white/10 md:block">
          <FauxMap listings={results} />
        </section>

        {/* LISTINGS RIGHT (scrollable) */}
        <section className="relative h-[calc(100vh-128px)] overflow-y-auto">
          <div className="px-4 pt-4">
            <h1 className="mb-3 text-2xl font-semibold text-cyan-300/90">
              Toronto, ON Real Estate &amp; Homes
            </h1>

            <div className="grid grid-cols-1 gap-4">
              {results.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>

            {!results.length && (
              <div className="py-10 text-center text-white/60">
                No results. Try adjusting filters.
              </div>
            )}
            <div className="h-24" />
          </div>
        </section>
      </main>
    </div>
  );
}

/** ------------ simple map placeholder with price pins ------------ */
function FauxMap({ listings }: { listings: Listing[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const bounds = { west: -79.9, east: -79.0, south: 43.55, north: 43.95 };

  const project = (lat: number, lng: number, w: number, h: number) => {
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * w;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * h;
    return { x, y };
  };

  return (
    <div
      ref={ref}
      className="relative h-full w-full bg-[radial-gradient(800px_400px_at_30%_20%,rgba(0,180,255,0.15),transparent)]"
    >
      <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3af" />
            <stop offset="100%" stopColor="#6bf" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#g)" opacity="0.06" />
      </svg>

      {listings.map((l) => {
        const rect = ref.current?.getBoundingClientRect();
        const w = rect?.width ?? 1;
        const h = rect?.height ?? 1;
        const { x, y } = project(l.lat, l.lng, w, h);
        return (
          <button
            key={l.id}
            className="absolute -translate-x-1/2 -translate-y-full rounded-full border border-white/20 bg-black/70 px-2.5 py-1 text-xs text-white shadow-md hover:bg-black/85"
            style={{ left: x, top: y }}
            title={`C$${l.price.toLocaleString()}`}
          >
            C${l.price.toLocaleString()}
          </button>
        );
      })}
    </div>
  );
}

/** --------------------------- card ------------------------------- */
function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur">
      <div className="grid grid-cols-[200px_1fr_auto] items-start gap-12">
        <div className="overflow-hidden rounded-xl">
          <img
            src={`https://picsum.photos/seed/${listing.id}/800/600`}
            alt={listing.address}
            className="h-40 w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="space-y-1">
          <div className="text-lg font-semibold text-white">
            C${listing.price.toLocaleString()}
          </div>
          <div className="text-sm text-white/80">
            {listing.beds} bd • {listing.baths} ba • {listing.type}
          </div>
          <div className="text-sm text-white/60">{listing.address}</div>
          <div className="text-xs text-white/50">Viewed {listing.views} times</div>
        </div>

        <div className="flex h-full min-w-[92px] items-start justify-end">
          <div className="rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-center">
            <div className="text-[10px] uppercase tracking-wide text-cyan-200/80">Zelr Score</div>
            <div className="text-2xl font-bold text-cyan-300">{listing.score}</div>
          </div>
        </div>
      </div>
    </article>
  );
}