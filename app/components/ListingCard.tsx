"use client";

import Link from "next/link";

interface Listing {
  id: number | string;
  title: string;
  city: string;
  province: string;
  price: string;
  image: string;
}

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listing/${String(listing.id)}`}
      className="group rounded-lg overflow-hidden ring-1 ring-white/10 bg-black/30 hover:ring-white/25 transition block"
    >
      <div className="relative">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-48 object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-0.5 rounded">
          {listing.city}, {listing.province}
        </div>
      </div>
      <div className="p-4">
        <div className="text-lg font-semibold">{listing.price}</div>
        <div className="text-white/80">{listing.title}</div>
        <div className="text-white/50 text-xs mt-2 line-clamp-1">
          {listing.city}, {listing.province}
        </div>
      </div>
    </Link>
  );
}