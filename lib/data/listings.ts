export type Listing = {
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

export const mockListings: Listing[] = (() => {
  const out: Listing[] = [];
  let r = 1337;
  const rand = () => (r = (r * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const types = ["house", "condo", "townhouse", "semi"] as const;

  for (let i = 0; i < 120; i++) {
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
      price, beds, baths, type, views, score,
      address: `${100 + Math.floor(rand() * 900)} Example St, Toronto, ON`,
      lat, lng
    });
  }
  return out;
})();