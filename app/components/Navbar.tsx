"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-wide">
          ZELR<span className="opacity-70">.ca</span>
        </Link>
        <div className="hidden md:flex gap-6 text-sm text-white/70">
          <Link href="#">Buy</Link>
          <Link href="#">Sell</Link>
          <Link href="#">Rent</Link>
          <Link href="#">Mortgage</Link>
        </div>
        <Link
          href="#"
          className="text-sm rounded-lg px-3 py-1.5 bg-white text-black font-medium"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
}