import { useCallback, useEffect, useState } from "react";

/**
 * Device-local storage for Alafia (demo version). This is NOT secure medical storage:
 * every reader/writer goes through here so a future authenticated backend can replace it.
 */
export const STORE_PREFIX = "alafia.";
const EVENT = "alafia:storage";

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

export function removeKey(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

export function clearLocalData() {
  if (typeof window === "undefined") return;
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(STORE_PREFIX))
    .forEach((k) => window.localStorage.removeItem(k));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: "*" }));
}

/** Reads after hydration (no SSR mismatch) and stays in sync across components. */
export function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setValue(readJSON(key, fallback));
    setReady(true);
    const onChange = (e: Event) => {
      const changed = (e as CustomEvent<string>).detail;
      if (changed === key || changed === "*") setValue(readJSON(key, fallback));
    };
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
    // fallback is intentionally read once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      writeJSON(key, next);
    },
    [key],
  );

  return [value, update, ready] as const;
}

export function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.round(performance.now() * 1000)}`;
}

