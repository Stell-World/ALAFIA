import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ClipboardList, HeartPulse, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Notice } from "@/components/alafia/Notice";
import { HealthInfoPanel } from "@/components/alafia/HealthInfoPanel";
import { MedicalDocuments } from "@/components/alafia/MedicalDocuments";
import { MedicationsPanel } from "@/components/alafia/MedicationsPanel";
import { RemindersPanel } from "@/components/alafia/RemindersPanel";
import { PageHeader } from "@/components/alafia/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionGate } from "@/components/alafia/SubscriptionGate";
import { useStoredState } from "@/lib/local-store";
import {
  HEALTH_INFO_KEY,
  EMPTY_HEALTH_INFO,
  MEDICATIONS_KEY,
  type HealthInfo,
  type Medication,
} from "@/lib/health-storage";
import { getHealthAdvice } from "@/lib/health-advice";
import { DEFAULT_SETTINGS, SETTINGS_KEY, type Settings } from "@/lib/profile-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  MEASURE_TYPES,
  addEntry,
  loadEntries,
  removeEntry,
  saveEntries,
  type MeasureType,
  type TrackingEntry,
} from "@/lib/tracking-storage";

export const Route = createFileRoute("/suivi")({
  head: () => ({
    meta: [
      { title: "Mon suivi personnel — Alafia" },
      {
        name: "description",
        content:
          "Enregistrez vos mesures de santé et consultez votre historique, sur votre appareil.",
      },
      { property: "og:title", content: "Mon suivi personnel — Alafia" },
      {
        property: "og:description",
        content: "Poids, tension, température : gardez un historique simple de vos mesures.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuiviPage,
});

const today = () => new Date().toISOString().slice(0, 10);

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SuiviPage() {
  const [healthInfo] = useStoredState<HealthInfo>(HEALTH_INFO_KEY, EMPTY_HEALTH_INFO);
  const [medications] = useStoredState<Medication[]>(MEDICATIONS_KEY, []);
  const [settings] = useStoredState<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const [entries, setEntries] = useState<TrackingEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [type, setType] = useState<MeasureType>("poids");
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadEntries());
    setDate(today());
    setReady(true);
  }, []);

  function update(next: TrackingEntry[]) {
    setEntries(next);
    saveEntries(next);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return setFormError("Veuillez indiquer une valeur.");
    if (!date) return setFormError("Veuillez choisir une date.");
    setFormError(null);
    update(
      addEntry(entries, {
        id: crypto.randomUUID(),
        type,
        value: value.trim(),
        date,
        note: note.trim() || undefined,
        createdAt: Date.now(),
      }),
    );
    setValue("");
    setNote("");
    toast.success("Mesure enregistrée", { description: "Elle apparaît dans votre historique." });
  }

  function onDelete(entry: TrackingEntry) {
    update(removeEntry(entries, entry.id));
    toast("Entrée supprimée", {
      action: {
        label: "Annuler",
        onClick: () => update(addEntry(removeEntry(entries, entry.id), entry)),
      },
    });
  }

  const meta = MEASURE_TYPES[type];

  return (
    <>
      <PageHeader
        icon={HeartPulse}
        eyebrow="Mon suivi"
        title="Suivez vos mesures, simplement"
        description="Notez régulièrement vos mesures pour les montrer à votre professionnel de santé lors de votre prochaine visite."
      />
      <div className="container-page py-8">
        <Tabs defaultValue="mesures">
          <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1">
            <TabsTrigger value="mesures">Mes mesures</TabsTrigger>
            <TabsTrigger value="sante">Santé</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="medicaments">Médicaments</TabsTrigger>
            <TabsTrigger value="rappels">Rappels</TabsTrigger>
            <TabsTrigger value="conseils">Conseils</TabsTrigger>
          </TabsList>
          <TabsContent
            value="mesures"
            className="grid grid-cols-1 gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]"
          >
            <section
              aria-labelledby="form-title"
              className="h-fit rounded-3xl border border-border/70 bg-card p-6 shadow-card"
            >
              <h2 id="form-title" className="flex items-center gap-2 text-lg font-semibold">
                <Plus className="size-5 text-nature-deep" aria-hidden />
                Ajouter une mesure
              </h2>
              <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="type">Type de mesure</Label>
                  <Select value={type} onValueChange={(v) => setType(v as MeasureType)}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MEASURE_TYPES).map(([key, m]) => (
                        <SelectItem key={key} value={key}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">
                    Valeur{" "}
                    {meta.unit && <span className="text-muted-foreground">({meta.unit})</span>}
                  </Label>
                  <Input
                    id="value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={meta.placeholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    max={today()}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note (facultatif)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="ex. mesure prise le matin"
                    rows={2}
                  />
                </div>
                {formError && (
                  <p role="alert" className="text-sm font-medium text-destructive">
                    {formError}
                  </p>
                )}
                <Button type="submit" className="w-full" size="lg">
                  Enregistrer
                </Button>
              </form>
            </section>

            <section aria-labelledby="history-title" className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <h2 id="history-title" className="text-xl font-semibold">
                  Historique
                </h2>
                {entries.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {entries.length} entrée{entries.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {ready && entries.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-mint bg-card/60 px-6 py-14 text-center">
                  <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
                    <ClipboardList className="size-7" aria-hidden />
                  </span>
                  <h3 className="text-lg font-semibold">Aucune mesure pour le moment</h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Ajoutez votre première mesure avec le formulaire. Elle sera enregistrée sur cet
                    appareil.
                  </p>
                </div>
              )}

              <ul className="space-y-3">
                {entries.map((entry) => {
                  const m = MEASURE_TYPES[entry.type];
                  return (
                    <li
                      key={entry.id}
                      className="flex items-start gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-soft"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint-soft text-nature-deep">
                        <HeartPulse className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
                        <p className="font-display text-xl font-semibold text-primary">
                          {entry.value}{" "}
                          <span className="text-sm font-medium text-muted-foreground">
                            {m.unit}
                          </span>
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="size-3.5" aria-hidden />
                          {formatDate(entry.date)}
                        </p>
                        {entry.note && <p className="mt-2 text-sm text-foreground">{entry.note}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(entry)}
                        aria-label={`Supprimer la mesure ${m.label} du ${formatDate(entry.date)}`}
                      >
                        <Trash2 />
                      </Button>
                    </li>
                  );
                })}
              </ul>

              <Notice>
                Vos mesures restent sur votre appareil. Elles ne constituent pas un avis médical :
                parlez-en avec un professionnel de santé si une valeur vous inquiète.
              </Notice>
            </section>
          </TabsContent>
          <TabsContent value="sante">
            <SubscriptionGate feature="Le dossier santé"><HealthInfoPanel /></SubscriptionGate>
          </TabsContent>
          <TabsContent value="documents">
            <SubscriptionGate feature="Les documents médicaux"><MedicalDocuments /></SubscriptionGate>
          </TabsContent>
          <TabsContent value="medicaments">
            <SubscriptionGate feature="Le suivi des médicaments"><MedicationsPanel /></SubscriptionGate>
          </TabsContent>
          <TabsContent value="rappels">
            <SubscriptionGate feature="Les rappels de santé"><RemindersPanel /></SubscriptionGate>
          </TabsContent>
          <TabsContent value="conseils">
            <SubscriptionGate feature="Les conseils personnalisés">
            <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft md:p-8">
              <h2 className="text-lg font-semibold">Conseils adaptés à mon suivi</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ces repères généraux utilisent les informations que vous avez choisi de renseigner.
                Ils ne remplacent pas un avis médical.
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {getHealthAdvice(
                  settings.personalizedAdvice ? healthInfo : EMPTY_HEALTH_INFO,
                  settings.personalizedAdvice ? medications : [],
                ).map((tip) => (
                  <article key={tip.id} className="rounded-2xl bg-mint-soft p-4">
                    <h3 className="font-semibold">{tip.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed">{tip.text}</p>
                  </article>
                ))}
              </div>
              {!settings.personalizedAdvice && (
                <p className="mt-4 text-sm text-muted-foreground">
                  L’adaptation est désactivée dans vos préférences de profil. Vous pouvez la
                  réactiver dans Mon profil.
                </p>
              )}
            </section>
            </SubscriptionGate>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
