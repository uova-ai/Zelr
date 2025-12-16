// app/data/listings.ts

// Core listing shape used throughout the app
export interface Listing {
  id: number;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  price: number; // in CAD
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;

  // Intelligence inputs (0–100, higher = better)
  crimeScore: number; // safety
  schoolScore: number;
  transitScore: number;
  renovationScore: number;
  marketVelocityScore: number; // how “hot” the sub-area is

  // Location
  lat: number;
  lng: number;

  // UI stuff
  tag?: "HOT" | "NEW" | "PRIME" | "REDUCED";
  imageUrls: string[];

  // Zelr intelligence outputs
  zelrScore: number; // final calculated score 0–100
  score: number; // mirror of zelrScore for older components using `score`
}

// Same listing but without the computed scores
type ListingInput = Omit<Listing, "zelrScore" | "score">;

// ---------- ZELR SCORE ENGINE v0.1 ----------

// Simple, explainable scoring model.
// We’ll evolve this later with real market data.
function calculateZelrScore(listing: ListingInput): number {
  let score = 0;

  // 1) Safety (weight: 20)
  score += normalize(listing.crimeScore, 0, 100) * 20;

  // 2) Schools (weight: 20)
  score += normalize(listing.schoolScore, 0, 100) * 20;

  // 3) Transit / walkability (weight: 15)
  score += normalize(listing.transitScore, 0, 100) * 15;

  // 4) Renovation / condition (weight: 15)
  score += normalize(listing.renovationScore, 0, 100) * 15;

  // 5) Market velocity (how hot the area is) (weight: 15)
  score += normalize(listing.marketVelocityScore, 0, 100) * 15;

  // 6) Basic home fundamentals (beds / baths / size / age) (weight: 15)
  const sizeScore = clamp((listing.sqft - 900) / (3200 - 900), 0, 1); // 900–3200 sqft
  const bedScore = clamp((listing.beds - 2) / (5 - 2), 0, 1); // 2–5 beds
  const bathScore = clamp((listing.baths - 1) / (4 - 1), 0, 1); // 1–4 baths

  const currentYear = new Date().getFullYear();
  const age = currentYear - listing.yearBuilt;
  // Newer homes get a bit of a boost, but not everything
  const ageScore = clamp((40 - age) / 40, 0, 1); // 0 yrs old = 1, 40+ = 0

  const fundamentals =
    0.35 * sizeScore + 0.25 * bedScore + 0.2 * bathScore + 0.2 * ageScore;

  score += fundamentals * 15;

  // Clamp to [0, 100]
  return clamp(score, 0, 100);
}

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ---------- RAW MOCK LISTINGS (INPUTS) ----------

const baseListings: ListingInput[] = [
  {
    id: 1,
    address: "45 Maple Ave #170",
    city: "Burlington",
    province: "ON",
    price: 1134000,
    beds: 3,
    baths: 3,
    sqft: 1850,
    yearBuilt: 2015,

    crimeScore: 82,
    schoolScore: 88,
    transitScore: 70,
    renovationScore: 86,
    marketVelocityScore: 78,

    lat: 43.3255,
    lng: -79.7990,
    tag: "PRIME",
    imageUrls: [
      "https://images.unsplash.com/photo-1512914890250-353c97c9e7e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 2,
    address: "123 King St W #140",
    city: "Toronto",
    province: "ON",
    price: 1249000,
    beds: 3,
    baths: 2,
    sqft: 1450,
    yearBuilt: 2018,

    crimeScore: 68,
    schoolScore: 91,
    transitScore: 95,
    renovationScore: 90,
    marketVelocityScore: 88,

    lat: 43.6475,
    lng: -79.3820,
    tag: "HOT",
    imageUrls: [
      "https://images.unsplash.com/photo-1600607687920-4e2a5340b2d7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 3,
    address: "88 Lakeshore Rd #104",
    city: "Mississauga",
    province: "ON",
    price: 903400,
    beds: 2,
    baths: 2,
    sqft: 1200,
    yearBuilt: 2012,

    crimeScore: 76,
    schoolScore: 83,
    transitScore: 82,
    renovationScore: 80,
    marketVelocityScore: 84,

    lat: 43.5636,
    lng: -79.5791,
    tag: "NEW",
    imageUrls: [
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 4,
    address: "2199 Glenview Dr",
    city: "Oakville",
    province: "ON",
    price: 1795000,
    beds: 4,
    baths: 4,
    sqft: 2600,
    yearBuilt: 2009,

    crimeScore: 89,
    schoolScore: 94,
    transitScore: 72,
    renovationScore: 92,
    marketVelocityScore: 90,

    lat: 43.4675,
    lng: -79.6877,
    tag: "HOT",
    imageUrls: [
      "https://images.unsplash.com/photo-1600585154340-0ef3c08c0632?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

// ---------- FINAL EXPORT WITH REAL ZELR SCORES ----------

export const listings: Listing[] = baseListings.map((l) => {
  const zelrScore = Math.round(calculateZelrScore(l));

  return {
    ...l,
    zelrScore,
    score: zelrScore, // keep `score` for any existing components
  };
});