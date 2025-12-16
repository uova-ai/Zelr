"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import ReactDOM from "react-dom/client";
import ZelrPin from "./ZelrPin";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export type ListingForMap = {
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

interface ZelrMapProps {
  listings: ListingForMap[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onOpenOverlay?: (id: number) => void;
}

const CLUSTER_ZOOM_THRESHOLD = 11;

const ZelrMap: React.FC<ZelrMapProps> = ({
  listings,
  selectedId,
  onSelect,
  onOpenOverlay,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(10);
  const [previewId, setPreviewId] = useState<number | null>(null);

  const previewListing =
    listings.find((l) => l.id === previewId) ?? null;

  // create map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-79.3832, 43.6532], // Toronto-ish
      zoom: 10,
    });

    mapRef.current = map;
    setZoomLevel(map.getZoom());

    map.on("zoomend", () => {
      setZoomLevel(map.getZoom());
    });

    // clicking empty map closes preview + clears selection
    map.on("click", (e) => {
      const features = map.queryRenderedFeatures(e.point);
      if (!features || features.length === 0) {
        setPreviewId(null);
        onSelect(null);
      }
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [onSelect]);

  // keep preview in sync when selection comes from the right-side cards
  useEffect(() => {
    if (selectedId == null) return;
    setPreviewId(selectedId);
  }, [selectedId]);

  // build pins whenever zoom or listings change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const useClusterView = zoomLevel < CLUSTER_ZOOM_THRESHOLD;

    if (useClusterView) {
      // simple clustering by city (good enough for the demo)
      const clusters: Record<
        string,
        { latSum: number; lngSum: number; count: number }
      > = {};

      listings.forEach((l) => {
        const key = l.city || "cluster";
        if (!clusters[key]) {
          clusters[key] = { latSum: 0, lngSum: 0, count: 0 };
        }
        clusters[key].latSum += l.lat;
        clusters[key].lngSum += l.lng;
        clusters[key].count += 1;
      });

      Object.values(clusters).forEach((cluster) => {
        const center: [number, number] = [
          cluster.lngSum / cluster.count,
          cluster.latSum / cluster.count,
        ];

        const el = document.createElement("div");
        const root = ReactDOM.createRoot(el);
        root.render(
          <ZelrPin
            label={`${cluster.count} homes`}
            isSelected={false}
            onClick={() => {
              const m = mapRef.current;
              if (!m) return;
              const nextZoom = Math.max(
                CLUSTER_ZOOM_THRESHOLD + 1,
                m.getZoom() + 1.5
              );
              m.easeTo({
                center,
                zoom: nextZoom,
                duration: 600,
              });
            }}
          />
        );

        const marker = new mapboxgl.Marker(el).setLngLat(center).addTo(map);
        markersRef.current.push(marker);
      });
    } else {
      // individual listing pins with prices
      listings.forEach((listing) => {
        const center: [number, number] = [listing.lng, listing.lat];

        const el = document.createElement("div");
        const root = ReactDOM.createRoot(el);
        root.render(
          <ZelrPin
            label={listing.price}
            isSelected={selectedId === listing.id}
            onClick={() => {
              const m = mapRef.current;
              if (!m) return;

              onSelect(listing.id);
              setPreviewId(listing.id);

              const currentZoom = m.getZoom();
              const targetZoom = currentZoom < 13 ? 13 : currentZoom;

              m.easeTo({
                center,
                zoom: targetZoom, // never zoom out, only in or keep same
                duration: 500,
              });
            }}
          />
        );

        const marker = new mapboxgl.Marker(el).setLngLat(center).addTo(map);
        markersRef.current.push(marker);
      });
    }
  }, [listings, zoomLevel, selectedId, onSelect]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden rounded-2xl"
      />

      {previewListing && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-20 flex w-full max-w-md -translate-x-1/2 justify-center">
          <MapPreviewCard
            listing={previewListing}
            onClose={() => {
              setPreviewId(null);
              onSelect(null);
            }}
            onOpenOverlay={() => {
              if (onOpenOverlay) onOpenOverlay(previewListing.id);
            }}
          />
        </div>
      )}
    </div>
  );
};

interface MapPreviewCardProps {
  listing: ListingForMap;
  onClose: () => void;
  onOpenOverlay?: () => void;
}

/**
 * Compact map preview card
 * - small, clean layout
 * - mini carousel inside the card with arrows
 * - clicking the image opens the full overlay
 */
const MapPreviewCard: React.FC<MapPreviewCardProps> = ({
  listing,
  onClose,
  onOpenOverlay,
}) => {
  const [index, setIndex] = useState(0);

  const images =
    listing.imageUrls && listing.imageUrls.length > 0
      ? listing.imageUrls
      : [
          "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=80",
        ];

  const current = images[Math.min(index, images.length - 1)];

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="pointer-events-auto w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      {/* image + heart / more */}
      <div
        className="relative h-40 w-full cursor-pointer overflow-hidden"
        onClick={() => onOpenOverlay && onOpenOverlay()}
      >
        <img
          src={current}
          alt={listing.address}
          className="h-full w-full object-cover"
        />

        {/* top badges */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white">
            {listing.beds} bd · {listing.baths} ba
          </span>
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[13px] text-slate-700 shadow-sm"
          >
            ♡
          </button>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[16px] text-slate-700 shadow-sm"
          >
            …
          </button>
        </div>

        {/* carousel arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white text-[14px]"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white text-[14px]"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* text section */}
      <div className="flex items-start justify-between gap-2 px-3 py-2.5">
        <div className="space-y-0.5">
          <div className="text-[13px] font-medium text-slate-900">
            {listing.city}
          </div>
          <div className="text-[12px] text-slate-600">
            {listing.address}
          </div>
          <div className="text-[14px] font-semibold text-slate-900">
            {listing.price}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[13px] text-slate-600 hover:bg-slate-200"
        >
          ✕
        </button>
      </div>

      {/* slim CTA instead of massive pill */}
      <div className="flex items-center justify-between px-3 pb-3">
        <button
          type="button"
          onClick={() => onOpenOverlay && onOpenOverlay()}
          className="rounded-full bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-slate-800"
        >
          View full details
        </button>
        <span className="text-[11px] text-slate-400">
          Demo preview · images scroll here
        </span>
      </div>
    </div>
  );
};

export default ZelrMap;