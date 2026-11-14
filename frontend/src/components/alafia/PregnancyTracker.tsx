import { useState, type FormEvent } from "react";
import { CalendarPlus, HeartHandshake, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MedicalDocuments } from "@/components/alafia/MedicalDocuments";
import { Notice } from "@/components/alafia/Notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isAssistantConnected, sendChatMessage } from "@/lib/chat-api";
import {
  emptyPregnancy,
  DATE_KIND_LABELS,
  PREGNANCY_KEY,
  type Appointment,
  type PregnancyRecord,
} from "@/lib/pregnancy-storage";
import { EMPTY_PROFILE, PROFILE_KEY, type Profile } from "@/lib/profile-storage";
import { newId, useStoredState } from "@/lib/local-store";

function ageFromBirthDate(value: string) {
  if (!value) return null;
  const birthDate = new Date(`${value}T00:00:00`);
  const now = new Date();
  if (Number.isNaN(birthDate.getTime()) || birthDate > now) return null;
  return (
    now.getFullYear() -
    birthDate.getFullYear() -
    (now < new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0)
  );
}

export function PregnancyTracker() {
  const [record, setRecord] = useStoredState<PregnancyRecord>(PREGNANCY_KEY, emptyPregnancy());
  const [profile] = useStoredState<Profile>(PROFILE_KEY, EMPTY_PROFILE);
  const [appointment, setAppointment] = useState<Appointment>({
    id: "",
    date: "",
    time: "",
    place: "",
    reason: "",
    reminder: true,
  });
  const [consent, setConsent] = useState(false);
  const [advice, setAdvice] = useState("");
  const [adviceError, setAdviceError] = useState("");
  const [adviceBusy, setAdviceBusy] = useState(false);
  const age = ageFromBirthDate(profile.birthDate)?.toString() ?? record.age ?? "";
  const adviceReady = Boolean(
    consent &&
    isAssistantConnected &&
    record.discoveredDate &&
    age &&
    record.hasPrenatalConsult === "non",
  );

  function save(event: FormEvent) {
    event.preventDefault();
    if (!record.discoveredDate) {
      toast.error("Indiquez la date à laquelle vous avez découvert la grossesse.");
      return;
    }
    if (!record.hasPrenatalConsult) {
      toast.error("Précisez si vous avez déjà eu une consultation prénatale.");
      return;
    }
    if (record.hasPrenatalConsult === "oui" && !record.firstPrenatalVisitDate) {
      toast.error("Indiquez la date de votre première consultation prénatale.");
      return;
    }
    setRecord({ ...record, updatedAt: Date.now() });
    toast.success("Suivi de grossesse enregistré sur cet appareil");
  }

  function addAppointment(event: FormEvent) {
    event.preventDefault();
    if (!appointment.date) return;
    setRecord({
      ...record,
      appointments: [...(record.appointments ?? []), { ...appointment, id: newId() }],
      updatedAt: Date.now(),
    });
    setAppointment({ id: "", date: "", time: "", place: "", reason: "", reminder: true });
  }

  async function generateAdvice() {
    setAdviceError("");
    setAdvice("");
    if (!isAssistantConnected) {
      setAdviceError(
        "L’assistant IA n’est pas connecté pour le moment. Vos informations n’ont pas été envoyées.",
      );
      return;
    }
    if (!consent) {
      setAdviceError("Donnez votre accord pour envoyer ces informations à l’assistant Alafia.");
      return;
    }
    if (!record.discoveredDate || !age) {
      setAdviceError(
        "Indiquez la date de découverte de la grossesse et votre âge, ou ajoutez votre date de naissance dans Mon profil.",
      );
      return;
    }
    if (record.hasPrenatalConsult !== "non") {
      setAdviceError(
        "Pour cette génération de conseils, indiquez d’abord que vous n’avez pas encore eu de consultation prénatale.",
      );
      return;
    }
    setAdviceBusy(true);
    try {
      const prompt = [
        "Réponds en français avec des informations générales, prudentes et compréhensibles pour une personne enceinte au Togo.",
        "Ne pose aucun diagnostic, ne calcule ni terme ni nombre de semaines, ne prescris aucun médicament ou dosage et ne remplace pas un professionnel de santé.",
        "Si des signes d’urgence sont mentionnés, recommande une prise en charge immédiate sans retarder les soins.",
        `Âge indiqué par la personne : ${age} ans.`,
        `Date à laquelle elle a découvert la grossesse : ${record.discoveredDate}.`,
        "Elle indique ne pas avoir encore eu de consultation prénatale.",
        "Propose des étapes générales à discuter avec une sage-femme ou un médecin, et invite-la à prendre rendez-vous.",
      ].join("\n");
      const response = await sendChatMessage(
        [{ id: newId(), role: "user", content: prompt }],
        "fr-FR",
      );
      setAdvice(response);
    } catch {
      setAdviceError(
        "Les conseils n’ont pas pu être générés. Réessayez lorsque la connexion sera rétablie.",
      );
    } finally {
      setAdviceBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft md:p-8">
        <h2 className="text-xl font-semibold">Mon suivi de grossesse</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enregistrez les repères que vous connaissez. Alafia ne calcule pas de terme ni de date
          médicale.
        </p>
        <form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2">
          <fieldset className="space-y-3 rounded-2xl border border-border/70 p-4 sm:col-span-2">
            <legend className="px-1 text-sm font-semibold">Rappels de grossesse</legend>
            <p className="text-sm text-muted-foreground">Choisissez où recevoir les rappels de vos rendez-vous.</p>
            {([
              ["platform", "Sur la plateforme"],
              ["whatsapp", "Par WhatsApp"],
              ["sms", "Par SMS"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={record.reminderChannels?.includes(key) ?? key === "platform"} onChange={(event) => {
                  const current = record.reminderChannels ?? ["platform"];
                  const next = event.target.checked ? [...new Set([...current, key])] : current.filter((channel) => channel !== key);
                  setRecord({ ...record, reminderChannels: next });
                }} />
                {label}
              </label>
            ))}
            {(record.reminderChannels ?? []).some((channel) => channel === "sms" || channel === "whatsapp") && (
              <div className="space-y-2">
                <Label htmlFor="preg-reminder-phone">Numéro de téléphone</Label>
                <Input id="preg-reminder-phone" type="tel" autoComplete="tel" placeholder="Ex. +228…" value={record.reminderPhone ?? ""} onChange={(event) => setRecord({ ...record, reminderPhone: event.target.value })} />
              </div>
            )}
            <p className="text-xs text-muted-foreground">Les envois WhatsApp et SMS nécessitent l’activation du service de notification.</p>
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor="preg-discovered">Date de découverte de la grossesse</Label>
            <Input
              id="preg-discovered"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              required
              value={record.discoveredDate ?? ""}
              onChange={(event) => setRecord({ ...record, discoveredDate: event.target.value })}
            />
          </div>
          {ageFromBirthDate(profile.birthDate) !== null ? (
            <div className="space-y-2">
              <Label>Âge</Label>
              <p className="h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                {age} ans · repris de Mon profil
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="preg-age">Âge (facultatif)</Label>
              <Input
                id="preg-age"
                type="number"
                min="10"
                max="100"
                value={record.age ?? ""}
                onChange={(event) => setRecord({ ...record, age: event.target.value })}
                placeholder="En années"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="preg-date-kind">Autre date de suivi (facultatif)</Label>
            <select
              id="preg-date-kind"
              value={record.dateKind ?? "inconnue"}
              onChange={(event) =>
                setRecord({
                  ...record,
                  dateKind: event.target.value as PregnancyRecord["dateKind"],
                })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {Object.entries(DATE_KIND_LABELS).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {record.dateKind !== "inconnue" && (
            <div className="space-y-2">
              <Label htmlFor="preg-date">Date indiquée (facultative)</Label>
              <Input
                id="preg-date"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={record.date ?? ""}
                onChange={(event) => setRecord({ ...record, date: event.target.value })}
              />
            </div>
          )}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="prenatal-status">Avez-vous déjà eu une consultation prénatale ?</Label>
            <select
              id="prenatal-status"
              required
              value={record.hasPrenatalConsult ?? ""}
              onChange={(event) =>
                setRecord({
                  ...record,
                  hasPrenatalConsult: event.target.value as PregnancyRecord["hasPrenatalConsult"],
                })
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Choisir une réponse</option>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </select>
          </div>
          {record.hasPrenatalConsult === "oui" && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="first-prenatal-visit">
                Date de la première consultation prénatale
              </Label>
              <Input
                id="first-prenatal-visit"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                required
                value={record.firstPrenatalVisitDate ?? ""}
                onChange={(event) =>
                  setRecord({ ...record, firstPrenatalVisitDate: event.target.value })
                }
              />
            </div>
          )}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="preg-info">Informations personnelles facultatives</Label>
            <Textarea
              id="preg-info"
              rows={3}
              value={record.info ?? ""}
              onChange={(event) => setRecord({ ...record, info: event.target.value })}
              placeholder="Notes à garder pour votre prochain rendez-vous"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="preg-recs">Recommandations reçues (facultatif)</Label>
            <Textarea
              id="preg-recs"
              rows={3}
              value={record.recommendations ?? ""}
              onChange={(event) => setRecord({ ...record, recommendations: event.target.value })}
            />
          </div>
          <Button type="submit">
            <Save /> Enregistrer mon suivi
          </Button>
        </form>
      </section>

      {record.hasPrenatalConsult === "non" && (
        <section className="rounded-3xl border border-mint bg-mint-soft/40 p-6 shadow-soft md:p-8">
          <div className="flex items-center gap-3">
            <HeartHandshake className="size-6 text-nature-deep" />
            <div>
              <h2 className="text-lg font-semibold">Conseils généraux avec l’assistant IA</h2>
              <p className="text-sm text-muted-foreground">
                À partir de votre âge et de la date renseignée, si vous le souhaitez.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            L’assistant ne calcule pas le terme et ne remplace pas une consultation. N’indiquez pas
            de nom ni d’adresse dans ces informations.
          </p>
          <label className="mt-4 flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1 accent-primary"
            />
            <span>
              J’accepte d’envoyer à l’assistant Alafia mon âge et la date de découverte de ma
              grossesse pour générer des repères généraux. Mon nom, l’audio et mes documents ne sont
              pas envoyés.
            </span>
          </label>
          {!isAssistantConnected && (
            <p className="mt-3 text-sm text-muted-foreground">
              L’assistant n’est pas connecté actuellement; aucune information ne sera envoyée.
            </p>
          )}
          {isAssistantConnected && (!record.discoveredDate || !age) && (
            <p className="mt-3 text-sm text-muted-foreground">
              Indiquez la date de découverte et votre âge (ou ajoutez votre date de naissance dans
              Mon profil) pour continuer.
            </p>
          )}
          {adviceError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {adviceError}
            </p>
          )}
          <Button
            type="button"
            className="mt-4"
            disabled={adviceBusy || !adviceReady}
            onClick={() => void generateAdvice()}
          >
            {adviceBusy ? "Génération des conseils…" : "Générer mes conseils généraux"}
          </Button>
          {advice && (
            <article className="mt-5 rounded-2xl border border-border/70 bg-card p-5">
              <h3 className="font-semibold">Repères généraux générés</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{advice}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Ces informations ne remplacent pas l’avis d’une sage-femme ou d’un médecin.
              </p>
            </article>
          )}
        </section>
      )}
      {record.hasPrenatalConsult === "oui" && (
        <Notice>
          Vous avez indiqué avoir déjà eu une consultation prénatale. La date de votre première
          visite est conservée dans votre suivi; suivez les rendez-vous et recommandations de votre
          équipe de santé.
        </Notice>
      )}

      <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft md:p-8">
        <h2 className="text-lg font-semibold">Rendez-vous</h2>
        <form onSubmit={addAppointment} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="apt-date">Date</Label>
            <Input
              id="apt-date"
              type="date"
              value={appointment.date}
              onChange={(event) => setAppointment({ ...appointment, date: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apt-time">Heure (facultative)</Label>
            <Input
              id="apt-time"
              type="time"
              value={appointment.time}
              onChange={(event) => setAppointment({ ...appointment, time: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apt-place">Lieu (facultatif)</Label>
            <Input
              id="apt-place"
              value={appointment.place}
              onChange={(event) => setAppointment({ ...appointment, place: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apt-reason">Motif (facultatif)</Label>
            <Input
              id="apt-reason"
              value={appointment.reason}
              onChange={(event) => setAppointment({ ...appointment, reason: event.target.value })}
            />
          </div>
          <Button type="submit" className="sm:col-span-2">
            <CalendarPlus /> Ajouter le rendez-vous
          </Button>
        </form>
        <ul className="mt-4 space-y-2">
          {(record.appointments ?? []).map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-xl bg-mint-soft p-3">
              <div className="flex-1">
                <strong>{new Date(`${item.date}T00:00:00`).toLocaleDateString("fr-FR")}</strong>
                {item.time && ` · ${item.time}`}
                <p className="text-sm text-muted-foreground">
                  {[item.reason, item.place].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Supprimer le rendez-vous"
                onClick={() =>
                  setRecord({
                    ...record,
                    appointments: record.appointments.filter(
                      (appointmentItem) => appointmentItem.id !== item.id,
                    ),
                  })
                }
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </section>
      <MedicalDocuments scope="grossesse" />
    </div>
  );
}
