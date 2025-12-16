// app/components/Map.tsx
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

type ListingForMap = {
  id: string | number;
  latitude: number;
  longitude: number;
  // add any other fields you use elsewhere, but not required for the map
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

    // Mapbox token (make sure it exists locally + in Vercel env vars)
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-79.3832, 43.6532], // Toronto default
      zoom: 10,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    // Add markers
    for (const listing of listings) {
      const idNum = Number(listing.id);

      const el = document.createElement("div");
      el.className = "w-5 h-5 rounded-full cursor-pointer border border-white shadow";
      // highlight selected
      el.style.background = selectedId === idNum ? "#111827" : "#2563eb"; // black vs blue

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelect(idNum);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([listing.longitude, listing.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    }
  }, [listings, selectedId, onSelect]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}