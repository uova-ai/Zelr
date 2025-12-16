"use client";

import Image from "next/image";
import { listings } from "../../data/listings";

interface Props {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function ListingPanel({ selectedId, onSelect }: Props) {
  return (
    <div className="w-full h-full overflow-y-scroll bg-white border-l border-gray-200">
      {listings.map((listing) => (
        <div
          key={listing.id}
          onClick={() => onSelect(listing.id)}
          className={`p-3 cursor-pointer border-b ${
            selectedId === listing.id ? "bg-gray-100" : "bg-white"
          }`}
        >
          {/* IMAGE FIX — USE imageUrls[0] */}
          <div className="relative w-full h-40 mb-3">
            <Image
              src={listing.imageUrls[0]}     // ✅ THIS FIXES EVERYTHING
              alt={listing.address}
              fill
              sizes="100%"
              className="object-cover rounded"
            />
          </div>

          <div className="font-semibold text-lg">
            {listing.price}
          </div>

          <div className="text-sm text-gray-600">
            {listing.beds} beds • {listing.baths} baths
          </div>

          <div className="text-gray-700">{listing.address}</div>
        </div>
      ))}
    </div>
  );
}