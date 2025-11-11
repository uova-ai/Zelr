"use client";

import Link from "next/link";
import { listings } from "@/app/lib/mockListings";
import Navbar from "@/app/components/Navbar";
import ListingCard from "@/app/components/ListingCard";
import { useState } from "react";

export default function Home() {
  const [q, setQ] = useState("");

  const filtered = listings.filter((l) => {
    const needle = q.toLowerCase().trim();
    if (!needle) return true;
    return (
      l.city.toLowerCase().includes(needle) ||
      l.title.toLowerCase().includes(needle) ||
      (l as any).province.toLowerCase().includes(needle) ||
      (l as any).address?.toLowerCase?.().includes(needle)
    );
  });

  return (
    <main className="min-h-screen text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pt-14 pb-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Discover homes in Canada, <span className="opacity-80">smarter</span>
          </h1>
          <p className="mt-3 text-white/70">
            Zelr Score and property history coming soon — launch-ready search today.
          </p>
          <div className="mx-auto max-w-2xl mt-6 flex overflow-hidden rounded-xl ring-1 ring-white/15 bg-black/30 backdrop-blur">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 bg-transparent px-5 py-4 outline-none placeholder:text-white/50"
              placeholder="Search by city, address, or MLS® # (e.g., Toronto, M5V)…"
            />
            <button className="px-6 py-4 bg-white text-black font-medium">
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        {filtered.length === 0 ? (
          <div className="rounded-lg ring-1 ring-white/10 bg-black/30 p-6 text-center text-white/70">
            No matches for “{q}”. Try another city or address.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((l) => (
              <ListingCard key={String((l as any).id)} listing={l as any} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}