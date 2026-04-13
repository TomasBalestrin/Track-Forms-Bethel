import { create } from "zustand";

import type { LeadFilter } from "@/types/lead";

interface LeadsFilterState {
  filter: LeadFilter;
  page: number;
  setFilter: (filter: LeadFilter) => void;
  setPage: (page: number) => void;
  resetPagination: () => void;
}

export const useLeadsFilterStore = create<LeadsFilterState>((set) => ({
  filter: "all",
  page: 1,
  setFilter: (filter) => set({ filter, page: 1 }),
  setPage: (page) => set({ page }),
  resetPagination: () => set({ page: 1 }),
}));
