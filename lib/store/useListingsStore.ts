"use client";

import { create } from "zustand";

type State = {
  q: string;
  min: string;
  max: string;
  beds: string;
  baths: string;
  type: string;
  sort: "homes_for_you" | "price_asc" | "price_desc" | "newest";
  page: number;
  hoveredId: string | null;
};

type Actions = {
  setField: (k: keyof State, v: any) => void;
  setAll: (s: Partial<State>) => void;
  setHoveredId: (id: string | null) => void;
};

const useListingsStore = create<State & Actions>()((set) => ({
  q: "Toronto, ON",
  min: "",
  max: "",
  beds: "",
  baths: "",
  type: "",
  sort: "homes_for_you",
  page: 1,
  hoveredId: null,
  setField: (k, v) => set({ [k]: v } as any),
  setAll: (s) => set(s as any),
  setHoveredId: (id) => set({ hoveredId: id }),
}));

export default useListingsStore;