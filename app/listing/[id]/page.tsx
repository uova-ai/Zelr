import { notFound } from "next/navigation";
import Link from "next/link";
import { listings } from "@/app/lib/mockListings";

type PageParams = { params: { id: string } };

export default function ListingDetail({ params }: PageParams) {
  const home = listings.find((l: any) => String(l.id) === params.id);
  if (!home) return notFound();

  return (
    <main className="min-h-screen text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-wide">
            ZELR<span className="opacity-70">.ca</span>
          </Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            Back to search
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-8 grid md:grid-cols-2 gap-6">
        <div className="rounded-lg overflow-hidden ring-1 ring-white/10 bg-black/30">
          <img
            src={home.image}
            alt={home.title}
            className="w-full h-[360px] object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div>
          <h1 className="text-2xl font-semibold">{home.title}</h1>
          <div className="mt-1 text-white/70">
            {home.city}, {home.province}
          </div>
          <div className="mt-4 text-3xl font-semibold">{home.price}</div>

          <div className="mt-6 rounded-lg ring-1 ring-white/10 bg-black/30 p-4">
            <h3 className="font-medium mb-2">Zelr Score (preview)</h3>
            <p className="text-white/70 text-sm">
              AI score coming soon (market trends, price history, listing age, renos, more).
            </p>
          </div>

          <div className="mt-4 rounded-lg ring-1 ring-white/10 bg-black/30 p-4">
            <h3 className="font-medium mb-2">History (preview)</h3>
            <p className="text-white/70 text-sm">
              Sale & ownership history will appear here once MLS®/DDF® + provincial data are integrated.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}