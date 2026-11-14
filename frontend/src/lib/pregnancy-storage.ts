export const PREGNANCY_KEY = "alafia.grossesse.v1";

export type PrenatalVisit = { id: string; date: string; place: string; notes: string };
export type Appointment = {
  id: string;
  date: string;
  time: string;
  place: string;
  reason: string;
  reminder: boolean;
};

/** Information the person chose to record. Alafia does not compute any term or due date. */
export type PregnancyRecord = {
  dateKind: "dernieres-regles" | "debut" | "inconnue";
  date: string;
  discoveredDate: string;
  age: string;
  hasPrenatalConsult: "" | "oui" | "non";
  firstPrenatalVisitDate: string;
  info: string;
  visits: PrenatalVisit[];
  appointments: Appointment[];
  reminderChannels?: ("platform" | "whatsapp" | "sms")[];
  reminderPhone?: string;
  recommendations: string;
  updatedAt: number;
};

export const DATE_KIND_LABELS: Record<PregnancyRecord["dateKind"], string> = {
  "dernieres-regles": "Date des dernières règles",
  debut: "Date de début de grossesse indiquée",
  inconnue: "Date non connue",
};

export const emptyPregnancy = (): PregnancyRecord => ({
  dateKind: "inconnue",
  date: "",
  discoveredDate: "",
  age: "",
  hasPrenatalConsult: "",
  firstPrenatalVisitDate: "",
  info: "",
  visits: [],
  appointments: [],
  reminderChannels: ["platform"],
  reminderPhone: "",
  recommendations: "",
  updatedAt: 0,
});

/** Calendar difference only — not a medical calculation. */
export function daysUntil(dateKey: string, todayKey: string) {
  const a = new Date(`${todayKey}T00:00:00`).getTime();
  const b = new Date(`${dateKey}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function upcomingAppointments(record: PregnancyRecord, todayKey: string) {
  return record.appointments
    .filter((a) => a.date && a.date >= todayKey)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function pastVisits(record: PregnancyRecord) {
  return [...record.visits].sort((a, b) => b.date.localeCompare(a.date));
}
