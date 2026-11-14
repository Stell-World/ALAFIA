import { describe, expect, it } from "vitest";

import { PROFESSIONALS, filterProfessionals } from "@/data/doctors";
import { addEntry, loadEntries, removeEntry, saveEntries, type TrackingEntry } from "@/lib/tracking-storage";

const entry = (id: string, date: string): TrackingEntry => ({ id, type: "poids", value: "70", date, createdAt: 1 });

describe("Mon suivi", () => {
  it("deletes only the chosen entry", () => {
    const list = [entry("a", "2026-01-01"), entry("b", "2026-01-02")];
    expect(removeEntry(list, "a").map((e) => e.id)).toEqual(["b"]);
  });

  it("persists entries in local storage, newest date first", () => {
    localStorage.clear();
    saveEntries(addEntry([entry("a", "2026-01-01")], entry("b", "2026-03-01")));
    expect(loadEntries().map((e) => e.id)).toEqual(["b", "a"]);
  });
});

describe("Annuaire", () => {
  it("filters by specialty", () => {
    const res = filterProfessionals(PROFESSIONALS, "", "Pédiatrie");
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((p) => p.specialty === "Pédiatrie")).toBe(true);
  });

  it("search ignores accents and case", () => {
    expect(filterProfessionals(PROFESSIONALS, "pediatrie", null).length).toBe(
      filterProfessionals(PROFESSIONALS, "", "Pédiatrie").length,
    );
  });
});

