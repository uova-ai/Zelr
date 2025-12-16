"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

type ListingForMap = {
  id: number;
  latitude: number;
  longitude: number;
};

type MapProps = {
  listings: ListingForMap[];
  selectedId: number | null;
  onSelect: (id: number) => void; // ✅ number (not string)
};

export default function Map({ listings, selectedId, onSelect }: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    // Make sure NEXT_PUBLIC_MAPBOX_TOKEN exists locally + in Vercel env vars
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-79.3832, 43.6532], // Toronto default
      zoom: 10,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    listings.forEach((listing) => {
      const el = document.createElement("div");

      const isSelected = selectedId === listing.id;
      el.className = `w-5 h-5 rounded-full cursor-pointer border border-white shadow-md ${
        isSelected ? "bg-blue-600" : "bg-black"
      }`;

      el.addEventListener("click", () => {
        onSelect(listing.id); // ✅ number -> matches prop type
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([listing.longitude, listing.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [listings, selectedId, onSelect]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}