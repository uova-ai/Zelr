"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

type ListingForMap = {
  id: number;
  latitude: number;
  longitude: number;
  // add any other fields you need, but these are all Map requires
};

type MapProps = {
  listings: ListingForMap[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export default function Map({ listings, selectedId, onSelect }: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    // IMPORTANT: Ensure NEXT_PUBLIC_MAPBOX_TOKEN exists locally AND in Vercel env vars
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-79.8711, 43.2557], // default: Hamilton-ish
      zoom: 10,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
  }, []);

  // Render markers whenever listings or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    listings.forEach((listing) => {
      const el = document.createElement("div");

      const isSelected = selectedId === listing.id;
      el.className = `
        w-5 h-5 rounded-full cursor-pointer
        ${isSelected ? "bg-black" : "bg-blue-600"}
        border border-white shadow-md
      `.trim();

      el.addEventListener("click", () => onSelect(listing.id));

      const marker = new mapboxgl.Marker(el)
        .setLngLat([listing.longitude, listing.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [listings, selectedId, onSelect]);

  return <div ref={containerRef} className="h-full w-full" />;
}