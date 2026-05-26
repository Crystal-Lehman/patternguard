"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Standard } from "./types";
import { DEFAULT_STANDARDS } from "./default-standards";

interface StandardsContextType {
  standards: Standard[];
  addStandard: (standard: Standard) => void;
  updateStandard: (standard: Standard) => void;
  deleteStandard: (id: string) => void;
  toggleStandard: (id: string) => void;
  resetToDefaults: () => void;
  enabledStandards: Standard[];
}

const StandardsContext = createContext<StandardsContextType | null>(null);

const STORAGE_KEY = "patternguard-standards";

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSnapshot: Standard[] = DEFAULT_STANDARDS;

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

function getSnapshot(): Standard[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  try {
    cachedSnapshot = raw ? JSON.parse(raw) : DEFAULT_STANDARDS;
  } catch {
    cachedSnapshot = DEFAULT_STANDARDS;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): Standard[] {
  return DEFAULT_STANDARDS;
}

function persistStandards(next: Standard[]) {
  const json = JSON.stringify(next);
  localStorage.setItem(STORAGE_KEY, json);
  cachedRaw = json;
  cachedSnapshot = next;
  for (const listener of listeners) {
    listener();
  }
}

export function StandardsProvider({ children }: { children: ReactNode }) {
  const standards = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addStandard = useCallback((standard: Standard) => {
    persistStandards([...getSnapshot(), standard]);
  }, []);

  const updateStandard = useCallback((standard: Standard) => {
    persistStandards(
      getSnapshot().map((s) => (s.id === standard.id ? standard : s))
    );
  }, []);

  const deleteStandard = useCallback((id: string) => {
    persistStandards(getSnapshot().filter((s) => s.id !== id));
  }, []);

  const toggleStandard = useCallback((id: string) => {
    persistStandards(
      getSnapshot().map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    );
  }, []);

  const resetToDefaults = useCallback(() => {
    persistStandards(DEFAULT_STANDARDS);
  }, []);

  const enabledStandards = standards.filter((s) => s.enabled);

  return (
    <StandardsContext.Provider
      value={{
        standards,
        addStandard,
        updateStandard,
        deleteStandard,
        toggleStandard,
        resetToDefaults,
        enabledStandards,
      }}
    >
      {children}
    </StandardsContext.Provider>
  );
}

export function useStandards() {
  const context = useContext(StandardsContext);
  if (!context) {
    throw new Error("useStandards must be used within a StandardsProvider");
  }
  return context;
}
