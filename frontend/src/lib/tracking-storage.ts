export type MeasureType = "poids" | "tension" | "glycemie" | "temperature" | "autre";

export type TrackingEntry = {
  id: string;
  type: MeasureType;
  value: string;
  date: string; // YYYY-MM-DD
  note?: string | undefined;
  createdAt: number;
};

export const MEASURE_TYPES: Record<MeasureType, { label: string; unit: string; placeholder: string }> = {
  poids: { label: "Poids", unit: "kg", placeholder: "ex. 68" },
  tension: { label: "Tension artérielle", unit: "mmHg", placeholder: "ex. 12/8" },
  glycemie: { label: "Glycémie", unit: "g/L", placeholder: "ex. 0,95" },
  temperature: { label: "Température", unit: "°C", placeholder: "ex. 37,2" },
  autre: { label: "Autre", unit: "", placeholder: "Votre mesure" },
};

export const STORAGE_KEY = "alafia.suivi.v1";

export function loadEntries(storage: Storage = window.localStorage): TrackingEntry[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as TrackingEntry[]) : [];
    return Array.isArray(parsed) ? sortEntries(parsed) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: TrackingEntry[], storage: Storage = window.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function sortEntries(entries: TrackingEntry[]) {
  return [...entries].sort((a, b) =>
    a.date === b.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date),
  );
}

export function addEntry(entries: TrackingEntry[], entry: TrackingEntry) {
  return sortEntries([entry, ...entries]);
}

export function removeEntry(entries: TrackingEntry[], id: string) {
  return entries.filter((e) => e.id !== id);
}

