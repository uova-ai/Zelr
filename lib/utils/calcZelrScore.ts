// src/utils/calcZelrScore.ts

export type ZelrScoreListingInput = {
  id: number | string;
  city: string;
  price: string; // "$1,249,000"
  beds: number;
  baths: number;
  lat: number;
  lng: number;
  tag?: string;
};

/**
 * Parse a "$1,249,000" style string into a number of dollars.
 */
function parsePrice(price: string): number {
  const cleaned = price.replace(/[^0-9]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Clamp a value into [min, max].
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Compute median of a numeric array.
 */
function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Main entry: take your Listing array and return the same objects
 * but with a realistic Zelr Score in the `score` field (0–100).
 */
export function applyZelrScores<T extends ZelrScoreListingInput>(
  listings: T[]
): (T & { score: number })[] {
  if (!listings.length) return [];

  // 1) Group by city and compute median price-per-bedroom in each city.
  const cityToPricePerBed: Record<string, number[]> = {};
  const globalPricePerBed: number[] = [];

  for (const l of listings) {
    const price = parsePrice(l.price);
    const beds = l.beds || 1;
    const ppb = price / beds;

    if (!cityToPricePerBed[l.city]) {
      cityToPricePerBed[l.city] = [];
    }
    cityToPricePerBed[l.city].push(ppb);
    globalPricePerBed.push(ppb);
  }

  const cityToMedianPPB: Record<string, number> = {};
  for (const city of Object.keys(cityToPricePerBed)) {
    cityToMedianPPB[city] = median(cityToPricePerBed[city]);
  }
  const globalMedianPPB = median(globalPricePerBed) || 1;

  // GTA-ish center (placeholder until real demand heatmaps, etc.)
  const GTA_CENTER = { lat: 43.7, lng: -79.4 };

  return listings.map((l) => {
    const price = parsePrice(l.price);
    const beds = l.beds || 1;
    const baths = l.baths || 1;

    const cityMedianPPB =
      cityToMedianPPB[l.city] && cityToMedianPPB[l.city] > 0
        ? cityToMedianPPB[l.city]
        : globalMedianPPB;

    const pricePerBed = price / beds;
    const ratio = pricePerBed / cityMedianPPB; // ~1 = fair, <1 = cheap, >1 = expensive

    // --- 1) VALUE vs LOCAL MARKET (0–1) ---
    // If ratio = 1.0 → ~0.7 score (fair deal)
    // Cheaper than local median → closer to 1.0
    // 30% more expensive than local median → closer to 0.2
    const diff = ratio - 1; // -0.3 .. +0.3 typical
    const valueScoreRaw = 1 - diff / 0.6; // +/-0.3 -> +/-0.5 in score
    const valueScore = clamp(valueScoreRaw, 0.2, 1);

    // --- 2) FUNDAMENTALS (beds + baths) (0–1) ---
    // A nice "standard" detached (3 beds, 2 baths) should feel solid.
    const fundamentalsSize = beds + baths * 0.5; // baths count a bit less
    const fundamentalsScore = clamp(fundamentalsSize / 5, 0.3, 1);

    // --- 3) MOMENTUM (HOT / NEW tags) (0–1) ---
    let momentumScore = 0.6; // baseline
    if (l.tag === "HOT") momentumScore = 0.95;
    else if (l.tag === "NEW") momentumScore = 0.85;

    // --- 4) MICRO-LOCATION vs GTA center (0–1) ---
    const dLat = l.lat - GTA_CENTER.lat;
    const dLng = l.lng - GTA_CENTER.lng;
    const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111; // rough km
    // 0km → ~1.0, 50km → ~0.4, farther clamped at 0.3
    const locationScoreRaw = 1 - distKm / 80;
    const locationScore = clamp(locationScoreRaw, 0.3, 1);

    // --- Combine into final 0–100 score ---
    const combined =
      0.5 * valueScore +
      0.25 * fundamentalsScore +
      0.15 * momentumScore +
      0.1 * locationScore;

    const zelrScore = Math.round(clamp(combined, 0, 1) * 100);

    return {
      ...l,
      score: zelrScore,
    };
  });
}