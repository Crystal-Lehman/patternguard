"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { VerificationReport } from "./types";

interface HistoryContextType {
  history: VerificationReport[];
  addReport: (report: VerificationReport) => void;
  deleteReport: (id: string) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | null>(null);

const STORAGE_KEY = "patternguard-history";
const MAX_ENTRIES = 50;

const listeners = new Set<() => void>();

const EMPTY: VerificationReport[] = [];

let cachedRaw: string | null = null;
let cachedSnapshot: VerificationReport[] = EMPTY;

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cachedRaw = null;
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): VerificationReport[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  try {
    cachedSnapshot = raw ? JSON.parse(raw) : EMPTY;
  } catch {
    cachedSnapshot = EMPTY;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): VerificationReport[] {
  return EMPTY;
}

function persistHistory(next: VerificationReport[]) {
  const json = JSON.stringify(next);
  localStorage.setItem(STORAGE_KEY, json);
  cachedRaw = json;
  cachedSnapshot = next;
  for (const listener of listeners) {
    listener();
  }
}

export function HistoryProvider({ children }: { children: ReactNode }) {
  const history = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const addReport = useCallback((report: VerificationReport) => {
    const next = [report, ...getSnapshot().filter((r) => r.id !== report.id)];
    persistHistory(next.slice(0, MAX_ENTRIES));
  }, []);

  const deleteReport = useCallback((id: string) => {
    persistHistory(getSnapshot().filter((r) => r.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    persistHistory(EMPTY);
  }, []);

  return (
    <HistoryContext.Provider
      value={{ history, addReport, deleteReport, clearHistory }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}
