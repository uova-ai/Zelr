"use client";

import {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  GoogleMap,
  useJsApiLoader,
  OverlayView,
  Circle,
} from "@react-google-maps/api";
import ZelrPin from "./ZelrPin";
import ZelrMapPreviewCard from "./ZelrMapPreviewCard";

export type ListingForMap = {
  id: number | string;
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

type MapItem =
  | { type: "single"; listing: ListingForMap }
  | {
      type: "cluster";
      lat: number;
      lng: number;
      count: number;
      listings: ListingForMap[];
    };

type BoundsPayload = {
  north: number;
  south: number;
  east: number;
  west: number;
};

type SearchTarget = {
  center: { lat: number; lng: number };
  zoom: number;
};

type ZelrMapProps = {
  listings: ListingForMap[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onOpenOverlay?: (id: number) => void;
  onBoundsChange?: (bounds: BoundsPayload) => void;
  searchTarget?: SearchTarget | null;
};

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Canada-wide starting view (shows Vancouver + Toronto + Montreal)
const DEFAULT_CENTER = { lat: 57, lng: -100 };
const DEFAULT_ZOOM = 4;

export default function ZelrMap({
  listings,
  selectedId,
  onSelect,
  onOpenOverlay,
  onBoundsChange,
  searchTarget,
}: ZelrMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "zelr-google-map",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const [map, setMap] = useState<any>(null);
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
  const [previewId, setPreviewId] = useState<number | string | null>(null);
  const [provincesLoaded, setProvincesLoaded] = useState(false);
  const hasMountedRef = useRef(false);

  // Only start following external selectedId after first mount,
  // so we don't show a preview card on initial page load.
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (selectedId != null) {
      setPreviewId(selectedId);
    }
  }, [selectedId]);

  // Keep a fixed initial center; map will handle user panning.
  const center = useMemo(() => DEFAULT_CENTER, []);

  const handlePinClick = useCallback(
    (listing: ListingForMap) => {
 const id = Number(listing.id);
onSelect(id);
setPreviewId(id);
      if (map) {
        map.panTo({ lat: listing.lat, lng: listing.lng });
        // nudge map up so the selected pin sits just under the preview card
        map.panBy(0, -120);
      }
    },
    [map, onSelect]
  );

  // When searchTarget changes (e.g. "Hamilton, ON"), pan + zoom there.
  useEffect(() => {
    if (!map || !searchTarget) return;

    map.panTo(searchTarget.center);
    map.setZoom(searchTarget.zoom);
    setZoom(searchTarget.zoom);
  }, [map, searchTarget]);

  // ---------------------------
  //  Province outline helpers
  // ---------------------------

  const updateProvinceStyles = useCallback(() => {
    if (!map || typeof window === "undefined") return;
    const gm = (window as any).google?.maps;
    if (!gm) return;

    const currentZoom = map.getZoom() ?? DEFAULT_ZOOM;
    const show = currentZoom <= 5; // only show when fairly zoomed out

    map.data.setStyle(() => ({
      visible: show,
      strokeColor: "#0ea5e9",
      strokeOpacity: show ? 0.85 : 0,
      strokeWeight: 1.4,
      fillColor: "#0ea5e9",
      fillOpacity: show ? 0.1 : 0,
      clickable: true,
    }));
  }, [map]);

  // Load province / territory GeoJSON once when the map is ready
  useEffect(() => {
    if (!map || provincesLoaded || typeof window === "undefined") return;
    const gm = (window as any).google?.maps;
    if (!gm) return;

    const dataLayer = map.data;

    dataLayer.loadGeoJson("/geo/canada-provinces.geojson", {}, () => {
      setProvincesLoaded(true);
      updateProvinceStyles();
    });

    // Click a province → zoom into its bounds
    const clickListener = dataLayer.addListener(
      "click",
      (event: any) => {
        if (!event.feature || !map) return;

        const bounds = new gm.LatLngBounds();
        const geom = event.feature.getGeometry();
        if (!geom) return;

        geom.forEachLatLng((latLng: any) => {
          bounds.extend(latLng);
        });

        map.fitBounds(bounds);

        // After fitting, zoom will change → onZoomChanged will hide fills
      }
    );

    return () => {
      clickListener.remove();
      // We DO NOT remove the features here, so reloads aren't needed.
    };
  }, [map, provincesLoaded, updateProvinceStyles]);

  // Build clusters for zoomed-out view
  const mapItems: MapItem[] = useMemo(() => {
    if (!listings || listings.length === 0) return [];

    // Zoomed in enough → no clustering, show all price pins
    if (!zoom || zoom >= 14) {
      return listings.map((listing) => ({ type: "single", listing }));
    }

    // Basic distance threshold based on zoom (roughly "neighborhood" vs "city")
    const threshold =
      zoom >= 12 ? 0.01 : zoom >= 10 ? 0.02 : 0.04; // degrees lat/lng

    const remaining = [...listings];
    const items: MapItem[] = [];

    while (remaining.length) {
      const base = remaining.pop() as ListingForMap;
      const clusterMembers: ListingForMap[] = [base];

      for (let i = remaining.length - 1; i >= 0; i--) {
        const candidate = remaining[i];
        const dLat = base.lat - candidate.lat;
        const dLng = base.lng - candidate.lng;

        if (Math.abs(dLat) <= threshold && Math.abs(dLng) <= threshold) {
          clusterMembers.push(candidate);
          remaining.splice(i, 1);
        }
      }

      if (clusterMembers.length === 1) {
        items.push({ type: "single", listing: base });
      } else {
        const avgLat =
          clusterMembers.reduce((sum, l) => sum + l.lat, 0) /
          clusterMembers.length;
        const avgLng =
          clusterMembers.reduce((sum, l) => sum + l.lng, 0) /
          clusterMembers.length;

        items.push({
          type: "cluster",
          lat: avgLat,
          lng: avgLng,
          count: clusterMembers.length,
          listings: clusterMembers,
        });
      }
    }

    return items;
  }, [listings, zoom]);

  const previewListing =
    listings.find((l) => String(l.id) === String(previewId)) ?? null;

  // Helper to emit bounds back up to HomePage
  const emitBounds = useCallback(() => {
    if (!map || !onBoundsChange) return;
    const bounds = map.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    onBoundsChange({
      north: ne.lat(),
      south: sw.lat(),
      east: ne.lng(),
      west: sw.lng(),
    });
  }, [map, onBoundsChange]);

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
        Loading map…
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={DEFAULT_ZOOM}
        options={{
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
          minZoom: 3, // can zoom out to see all of Canada
          maxZoom: 18,
        }}
        onLoad={(mapInstance) => {
          setMap(mapInstance);
          const z = mapInstance.getZoom();
          if (typeof z === "number") setZoom(z);

          // initial bounds → initial visible listings
          if (onBoundsChange) {
            const b = mapInstance.getBounds();
            if (b) {
              const ne = b.getNorthEast();
              const sw = b.getSouthWest();
              onBoundsChange({
                north: ne.lat(),
                south: sw.lat(),
                east: ne.lng(),
                west: sw.lng(),
              });
            }
          }

          // apply initial province styling after load
          setTimeout(updateProvinceStyles, 0);
        }}
        onClick={() => setPreviewId(null)}
        onZoomChanged={() => {
          if (!map) return;
          const z = map.getZoom();
          if (typeof z === "number") setZoom(z);
          updateProvinceStyles(); // hide/show outlines based on zoom
        }}
        onIdle={emitBounds} // fires after pan / zoom / search jumps
      >
        {/* 🔵 Search highlight area (simple circle for now) */}
        {searchTarget && (
          <Circle
            center={searchTarget.center}
            radius={12000} // ~12km radius – demo "city" highlight
            options={{
              strokeColor: "#0ea5e9",
              strokeOpacity: 0.9,
              strokeWeight: 1.5,
              fillColor: "#0ea5e9",
              fillOpacity: 0.08,
              clickable: false,
            }}
          />
        )}

        {/* 📍 PINS / CLUSTERS */}
        {mapItems.map((item, index) => {
          if (item.type === "single") {
            const listing = item.listing;
            return (
              <OverlayView
                key={`listing-${listing.id}-${index}`}
                position={{ lat: listing.lat, lng: listing.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                getPixelPositionOffset={(width = 0, height = 0) => ({
                  x: -width / 2,
                  y: -height,
                })}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinClick(listing);
                  }}
                >
                  <ZelrPin
                    label={listing.price}
                    isSelected={
                      previewId != null &&
                      String(previewId) === String(listing.id)
                    }
                  />
                </div>
              </OverlayView>
            );
          }

          // cluster item
          return (
            <OverlayView
              key={`cluster-${item.lat}-${item.lng}-${index}`}
              position={{ lat: item.lat, lng: item.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={(width = 0, height = 0) => ({
                x: -width / 2,
                y: -height,
              })}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (map) {
                    const currentZoom = map.getZoom() ?? 10;
                    const targetZoom = Math.min(currentZoom + 2, 16); // zoom closer, but not max
                    map.panTo({ lat: item.lat, lng: item.lng });
                    map.setZoom(targetZoom);
                    setZoom(targetZoom);
                    updateProvinceStyles();
                  }
                }}
              >
                <ZelrPin label={`${item.count} homes`} isSelected={false} />
              </div>
            </OverlayView>
          );
        })}
      </GoogleMap>

      {/* PREVIEW CARD – only after user clicks a pin / selects externally */}
      {previewListing && (
        <div
          className="pointer-events-auto absolute left-1/2 top-4 -translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          <ZelrMapPreviewCard
            listing={previewListing}
            onClose={() => setPreviewId(null)}
            onOpenOverlay={() => {
              if (onOpenOverlay) {
const [previewListing, setPreviewListing] = useState<ListingForMap | null>(null);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}