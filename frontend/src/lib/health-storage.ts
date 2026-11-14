export const HEALTH_INFO_KEY = "alafia.sante.v1";
export const MEDICATIONS_KEY = "alafia.medicaments.v1";

export type YesNo = "" | "oui" | "non" | "nsp";

/** What the user chose to share. Never interpreted as a diagnosis. */
export type HealthInfo = {
  chronic: YesNo;
  chronicDetail: string;
  pain: YesNo;
  painLocation: string;
  painSince: string;
  painFrequency: string;
  extra: string;
  updatedAt: number | null;
};

export const EMPTY_HEALTH_INFO: HealthInfo = {
  chronic: "",
  chronicDetail: "",
  pain: "",
  painLocation: "",
  painSince: "",
  painFrequency: "",
  extra: "",
  updatedAt: null,
};

export const PAIN_FREQUENCIES = [
  "Tous les jours",
  "Plusieurs fois par semaine",
  "Quelques fois par mois",
  "De temps en temps",
];

export type ReminderTime = { time: string; enabled: boolean };

/** Only what the user typed from their prescription: Alafia never suggests a dosage. */
export type Medication = {
  id: string;
  name: string;
  /** Legacy single-photo field kept to read older local records. */
  photoId: string | null;
  /** New records may keep several medication photos. */
  photoIds?: string[];
  indications: string;
  times: ReminderTime[];
  frequency: string;
  duration: string;
  startDate: string;
  endDate: string;
  createdAt: number;
};

export const FREQUENCIES = ["Tous les jours", "Certains jours de la semaine"];

export type UpcomingReminder = { medId: string; medName: string; time: string; at: Date };

const pad = (n: number) => String(n).padStart(2, "0");
export const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toTimeKey = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function isActiveOn(med: Medication, dateKey: string) {
  if (med.startDate && dateKey < med.startDate) return false;
  if (med.endDate && dateKey > med.endDate) return false;
  return true;
}

/** Next enabled reminder occurrences within `hours`, soonest first. */
export function upcomingReminders(meds: Medication[], now: Date, hours = 24): UpcomingReminder[] {
  const limit = now.getTime() + hours * 3600_000;
  const out: UpcomingReminder[] = [];
  for (const med of meds) {
    for (const t of med.times) {
      if (!t.enabled || !/^\d{2}:\d{2}$/.test(t.time)) continue;
      const [h, m] = t.time.split(":").map(Number) as [number, number];
      for (const offset of [0, 1]) {
        const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, h, m);
        if (at.getTime() < now.getTime() - 59_000 || at.getTime() > limit) continue;
        if (!isActiveOn(med, toDateKey(at))) continue;
        out.push({ medId: med.id, medName: med.name, time: t.time, at });
      }
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** Reminders scheduled for the current minute. */
export function dueReminders(meds: Medication[], now: Date) {
  const key = toTimeKey(now);
  const day = toDateKey(now);
  return meds.flatMap((med) =>
    med.times
      .filter((t) => t.enabled && t.time === key && isActiveOn(med, day))
      .map((t) => ({ medId: med.id, medName: med.name, time: t.time })),
  );
}
