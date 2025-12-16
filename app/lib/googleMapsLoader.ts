// app/lib/googleMapsLoader.ts
"use client";

import { useJsApiLoader } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

export function useGoogleMapsLoader() {
  const loader = useJsApiLoader({
    id: "zelr-google-map",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries,
  });

  return loader;
}