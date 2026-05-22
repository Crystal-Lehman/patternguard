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

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Standard[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // fall through
  }
  return DEFAULT_STANDARDS;
}

function getServerSnapshot(): Standard[] {
  return DEFAULT_STANDARDS;
}

function persistStandards(next: Standard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitChange();
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
