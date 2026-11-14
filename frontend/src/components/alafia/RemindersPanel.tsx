import { useEffect, useState } from "react";
import { BellRing, CalendarDays, Clock3 } from "lucide-react";
import { useStoredState } from "@/lib/local-store";
import { MEDICATIONS_KEY, upcomingReminders, type Medication } from "@/lib/health-storage";
import {
  emptyPregnancy,
  PREGNANCY_KEY,
  upcomingAppointments,
  type PregnancyRecord,
} from "@/lib/pregnancy-storage";
import { DEFAULT_SETTINGS, SETTINGS_KEY, type Settings } from "@/lib/profile-storage";

export function RemindersPanel() {
  const [meds] = useStoredState<Medication[]>(MEDICATIONS_KEY, []);
  const [pregnancy] = useStoredState<PregnancyRecord>(PREGNANCY_KEY, emptyPregnancy());
  const [settings] = useStoredState<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const medsDue = settings.notifyMedications ? upcomingReminders(meds, now, 24) : [];
  const appointments = settings.notifyPregnancy
    ? upcomingAppointments(pregnancy, today).filter((item) => item.reminder)
    : [];
  return (
    <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft md:p-8">
      <div className="flex items-center gap-3">
        <BellRing className="size-5 text-nature-deep" />
        <div>
          <h2 className="text-lg font-semibold">Mes rappels</h2>
          <p className="text-sm text-muted-foreground">
            Affichés lorsque l’application est ouverte.
          </p>
        </div>
      </div>
      {medsDue.length === 0 && appointments.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-mint-soft p-5 text-sm text-muted-foreground">
          Aucun rappel à venir. Vous pouvez ajouter des heures pour vos médicaments ou des
          rendez-vous dans les sections correspondantes.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {medsDue.map((item, i) => (
            <li
              key={`${item.medId}-${item.at.toISOString()}-${i}`}
              className="flex items-center gap-3 rounded-2xl bg-mint-soft p-4"
            >
              <Clock3 className="size-5 text-primary" />
              <div>
                <p className="font-medium">{item.medName}</p>
                <p className="text-sm text-muted-foreground">
                  {item.at.toLocaleDateString("fr-FR")} à {item.time}
                </p>
              </div>
            </li>
          ))}
          {appointments.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-mint-soft p-4">
              <CalendarDays className="size-5 text-primary" />
              <div>
                <p className="font-medium">{item.reason || "Rendez-vous"}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(`${item.date}T00:00:00`).toLocaleDateString("fr-FR")}
                  {item.time && ` à ${item.time}`}
                  {item.place && ` · ${item.place}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
