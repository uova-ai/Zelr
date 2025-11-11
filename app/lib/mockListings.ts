export type Listing = {
  id: number | string;
  title: string;
  city: string;
  province: string;
  price: string;
  image: string;
};

export const listings: Listing[] = [
  {
    id: 1,
    title: "Modern Downtown Condo",
    city: "Toronto",
    province: "ON",
    price: "C$899,000",
    image: "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Luxury Home by the Lake",
    city: "Vancouver",
    province: "BC",
    price: "C$2,100,000",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Cozy Suburban Townhouse",
    city: "Calgary",
    province: "AB",
    price: "C$645,000",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1400&auto=format&fit=crop",
  },
];