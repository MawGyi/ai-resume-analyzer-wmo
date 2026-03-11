import { create } from "zustand";

export interface HistoryEntry {
  id: string;
  timestamp: number;
  fileName: string;
  jobTitle: string;
  matchScore: number;
  overallVerdict: string;
  sectionScores?: {
    experience: number;
    skills: number;
    education: number;
    format: number;
    summary: number;
  };
  quantificationScore?: number;
  actionVerbScore?: number;
}

interface HistoryStore {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem("analysisHistory");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem("analysisHistory", JSON.stringify(entries.slice(0, 50)));
  } catch {
    // ignore quota errors
  }
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  entries: typeof window !== "undefined" ? loadHistory() : [],

  addEntry: (entry) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...get().entries].slice(0, 50);
    saveHistory(updated);
    set({ entries: updated });
  },

  removeEntry: (id) => {
    const updated = get().entries.filter((e) => e.id !== id);
    saveHistory(updated);
    set({ entries: updated });
  },

  clearHistory: () => {
    saveHistory([]);
    set({ entries: [] });
  },
}));
