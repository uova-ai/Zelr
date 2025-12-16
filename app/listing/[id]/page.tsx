import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Listing = {
  id: number;
  address: string;
  city: string;
  price: string;
  beds: number;
  baths: number;
  score: number;
  lat: number;
  lng: number;
  tag?: string;
  imageUrls?: string[];
};

// TEMP: same seed data as homepage.
// Later we’ll move this to a shared data file or API.
const listings: Listing[] = [
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
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1530518119128-ca0b9d7ef0a6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80",
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
    lat: 43.5645,
    lng: -79.5799,
    tag: "NEW",
    imageUrls: [
      "https://images.unsplash.com/photo-1600607687920-4e2a534ea583?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=800&q=80",
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
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80",
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
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

function getScoreColor(score: number) {
  if (score >= 85) return "bg-emerald-500/90 text-emerald-50";
  if (score >= 70) return "bg-amber-500/90 text-amber-50";
  return "bg-rose-500/90 text-rose-50";
}

export default function ListingPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const listing = listings.find((l) => l.id === id);

  if (!listing) {
    return notFound();
  }

  const images = listing.imageUrls ?? [];
  const mainImage =
    images[0] ??
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80";

  const scoreColor = getScoreColor(listing.score);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-zinc-50">
      {/* Top nav (same style as home) */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent"
          >
            Zelr
          </Link>

          <nav className="hidden gap-8 text-sm font-medium text-zinc-300 sm:flex">
            <button className="text-white">Buy</button>
            <button className="text-zinc-400 hover:text-white">Rent</button>
            <button className="text-zinc-400 hover:text-white">Sell</button>
          </nav>

          <div className="flex items-center gap-3">
            <button className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-zinc-200 hover:border-white/40 hover:text-white">
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Back link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-medium text-zinc-400 hover:text-zinc-200"
          >
            <span className="mr-1.5 text-sm">←</span>
            Back to search
          </Link>
        </div>

        {/* Top: title + price + score */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-50">
              {listing.address}
            </h1>
            <p className="text-sm text-zinc-400">{listing.city}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-semibold text-zinc-50">
                {listing.price}
              </div>
              <div className="text-xs text-zinc-400">
                {listing.beds} bd · {listing.baths} ba
              </div>
            </div>
            <div
              className={[
                "rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm",
                "backdrop-blur-sm border border-white/10",
                scoreColor,
              ].join(" ")}
            >
              <span className="mr-1 text-[11px] uppercase tracking-[0.16em] opacity-80">
                Zelr
              </span>
              <span className="text-sm">{listing.score}</span>
            </div>
          </div>
        </div>

        {/* Main layout: gallery + details sidebar */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
          {/* Gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl border border-white/8 bg-slate-900">
              <Image
                src={mainImage}
                alt={listing.address}
                fill
                className="object-cover"
              />
            </div>

            {/* Thumbnails row */}
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {images.slice(1).map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/8 bg-slate-900"
                  >
                    <Image
                      src={url}
                      alt={`${listing.address} photo ${idx + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details panel */}
          <aside className="space-y-4 rounded-2xl border border-white/8 bg-black/40 p-4 shadow-lg shadow-black/40">
            {/* Key facts */}
            <section>
              <h2 className="text-sm font-semibold text-zinc-100">
                Key details
              </h2>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-300">
                <div>
                  <p className="text-zinc-500">Price</p>
                  <p className="font-semibold text-zinc-50">
                    {listing.price}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Beds / Baths</p>
                  <p className="font-semibold text-zinc-50">
                    {listing.beds} bd · {listing.baths} ba
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Zelr Score</p>
                  <p className="font-semibold text-zinc-50">
                    {listing.score} / 100
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Location</p>
                  <p className="font-semibold text-zinc-50">
                    {listing.city}
                  </p>
                </div>
              </div>
            </section>

            {/* Placeholder description */}
            <section>
              <h2 className="text-sm font-semibold text-zinc-100">
                Home overview
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                This is a sample property description for Zelr. In the real
                product, this section will be populated from MLS data and
                enhanced with AI to highlight the key benefits, nearby
                amenities, and any red flags detected by Zelr&apos;s analysis.
              </p>
            </section>

            {/* Call-to-action */}
            <section className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-50">
              <p className="font-semibold text-sm">Ready to move on this?</p>
              <p className="mt-1 text-emerald-100/90">
                In the live version, buyers will be able to connect with a
                partner agent or submit an offer directly through Zelr.
              </p>
              <button className="mt-2 w-full rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-400">
                Contact agent (coming soon)
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}