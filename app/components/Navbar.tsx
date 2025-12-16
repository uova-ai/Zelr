// app/components/Navbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full bg-[#0B0E13]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* LEFT SIDE — Logo + ZELR.ca */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <Image
              src="/zelr-logo.png"
              alt="Zelr logo"
              width={62}
              height={62}
              className="object-contain"
              priority
            />
            <span className="ml-2 text-white text-lg font-semibold tracking-wide">
              ZELR.ca
            </span>
          </Link>
        </div>

        {/* CENTER — Navigation links */}
        <div className="flex-1 flex justify-center items-center space-x-8 text-sm font-medium text-zinc-200">
          <Link href="/buy" className="hover:text-white">Buy</Link>
          <Link href="/sell" className="hover:text-white">Sell</Link>
          <Link href="/rent" className="hover:text-white">Rent</Link>
          <Link href="/mortgage" className="hover:text-white">Mortgage</Link>
        </div>

        {/* RIGHT SIDE — Sign in button (WHITE) */}
        <div>
          <Link
            href="/signin"
            className="rounded-md bg-white px-3 py-1.5 text-[#0B0E13] font-medium hover:bg-gray-200 transition"
          >
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}