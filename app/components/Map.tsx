"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { listings } from "../../data/listings";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function Map({ selectedId, onSelect }: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-79.695, 43.468],
      zoom: 12,
    });

    listings.forEach((listing) => {
      const el = document.createElement("div");
      el.className = `w-5 h-5 rounded-full cursor-pointer ${
Number(selectedId) === listing.id ? "bg-blue-600" : "bg-black"
      }`;

      el.addEventListener("click", () => onSelect(listing.id));

      new mapboxgl.Marker(el)
        .setLngLat([listing.longitude, listing.latitude])
        .addTo(mapRef.current!);
    });

    return () => {
      mapRef.current?.remove();
    };
  }, [selectedId, onSelect]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}