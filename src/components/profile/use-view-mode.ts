import { useSyncExternalStore } from "react";

export type ViewMode = "list" | "grid";
const KEY = "profile:view";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function read(): ViewMode {
  try {
    return localStorage.getItem(KEY) === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
}

/** Remembers list/grid in localStorage; the server render always starts with "list". */
export function useViewMode() {
  const view = useSyncExternalStore(subscribe, read, () => "list" as ViewMode);
  const setView = (v: ViewMode) => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    listeners.forEach((l) => l());
  };
  return [view, setView] as const;
}
