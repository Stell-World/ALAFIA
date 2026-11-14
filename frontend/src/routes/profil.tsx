import { createFileRoute } from "@tanstack/react-router";
import { Bell, FileText, HeartPulse, LockKeyhole, Save, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";

import { Notice } from "@/components/alafia/Notice";
import { PageHeader } from "@/components/alafia/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { clearFiles } from "@/lib/file-store";
import { clearLocalData, useStoredState } from "@/lib/local-store";
import {
  DEFAULT_SETTINGS,
  EMPTY_PROFILE,
  PROFILE_KEY,
  SEX_OPTIONS,
  SETTINGS_KEY,
  resizeImage,
  type Profile,
  type Settings,
} from "@/lib/profile-storage";
import { NOTIFICATION_LABELS, notificationState, requestNotifications } from "@/lib/notifications";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil — Alafia" },
      { name: "description", content: "Gérez les informations que vous choisissez de conserver sur cet appareil." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile, ready] = useStoredState<Profile>(PROFILE_KEY, EMPTY_PROFILE);
  const [settings, setSettings] = useStoredState<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const [permission, setPermission] = useState(notificationState());
  const [photoError, setPhotoError] = useState("");

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile({ ...profile, [key]: value });
  }

  async function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Choisissez une image.");
      return;
    }
    try {
      setPhotoError("");
      update("photo", await resizeImage(file));
    } catch {
      setPhotoError("Cette image n'a pas pu être lue. Choisissez-en une autre.");
    }
  }

  async function enableNotifications() {
    const next = await requestNotifications();
    setPermission(next);
  }

  async function eraseData() {
    if (!window.confirm("Effacer toutes les données Alafia enregistrées sur cet appareil, y compris les documents ? Cette action est définitive.")) return;
    clearLocalData();
    try {
      await clearFiles();
      toast.success("Données locales supprimées");
    } catch {
      toast.error("Les documents n'ont pas pu être supprimés. Réessayez depuis cet appareil.");
    }
  }

  return (
    <>
      <PageHeader
        icon={UserRound}
        eyebrow="Mon profil"
        title="Les informations que vous choisissez de partager"
        description="Tous les champs sont facultatifs. Ces informations restent sur cet appareil dans cette version de démonstration."
      />
      <div className="container-page grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-card md:p-8">
            <div className="flex items-center gap-3">
              {profile.photo ? (
                <img src={profile.photo} alt="Photo de profil" className="size-16 rounded-2xl object-cover" />
              ) : (
                <span className="grid size-16 place-items-center rounded-2xl bg-secondary text-primary">
                  <UserRound className="size-7" aria-hidden />
                </span>
              )}
              <div>
                <h2 className="text-lg font-semibold">Photo facultative</h2>
                <p className="text-sm text-muted-foreground">Redimensionnée et gardée sur cet appareil.</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Label htmlFor="profile-photo" className="sr-only">Choisir une photo de profil</Label>
              <Input id="profile-photo" type="file" accept="image/*" onChange={onPhotoChange} className="max-w-sm" />
              <Button type="button" variant="ghost" disabled={!profile.photo} onClick={() => update("photo", null)}>
                <Trash2 />
                Retirer
              </Button>
            </div>
            {photoError && <p role="alert" className="mt-2 text-sm text-destructive">{photoError}</p>}
          </section>

          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              toast.success("Profil enregistré sur cet appareil");
            }}
          >
            <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft md:p-8">
              <h2 className="text-lg font-semibold">Informations personnelles</h2>
              <p className="mt-1 text-sm text-muted-foreground">Renseignez uniquement ce que vous souhaitez.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">Prénom</Label>
                  <Input id="first-name" autoComplete="given-name" value={profile.firstName} onChange={(e) => update("firstName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Nom</Label>
                  <Input id="last-name" autoComplete="family-name" value={profile.lastName} onChange={(e) => update("lastName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth-date">Date de naissance (facultative)</Label>
                  <Input id="birth-date" type="date" max={new Date().toISOString().slice(0, 10)} value={profile.birthDate} onChange={(e) => update("birthDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sexe (facultatif)</Label>
                  <select id="sex" value={profile.sex} onChange={(e) => update("sex", e.target.value as Profile["sex"])} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Ne pas renseigner</option>
                    {SEX_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville (facultative)</Label>
                  <Input id="city" autoComplete="address-level2" value={profile.city} onChange={(e) => update("city", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Quartier ou localisation (facultatif)</Label>
                  <Input id="location" autoComplete="street-address" value={profile.location} onChange={(e) => update("location", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="shared-health">Informations de santé à garder pour vous (facultatif)</Label>
                  <Textarea id="shared-health" rows={3} value={profile.sharedHealth} onChange={(e) => update("sharedHealth", e.target.value)} placeholder="Saisissez uniquement ce que vous souhaitez conserver." />
                </div>
              </div>
              <Button className="mt-5" type="submit" disabled={!ready}>
                <Save />
                Enregistrer
              </Button>
            </section>
          </form>

          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft md:p-8">
            <h2 className="text-lg font-semibold">Accès rapides</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a href="/suivi" className="flex items-center gap-3 rounded-2xl bg-mint-soft p-4 font-medium text-primary hover:bg-secondary">
                <HeartPulse className="size-5" aria-hidden /> Mon suivi
              </a>
              <a href="/suivi#documents" className="flex items-center gap-3 rounded-2xl bg-mint-soft p-4 font-medium text-primary hover:bg-secondary">
                <FileText className="size-5" aria-hidden /> Documents médicaux
              </a>
            </div>
          </section>

          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft md:p-8">
            <div className="flex items-center gap-3">
              <Bell className="size-5 text-nature-deep" aria-hidden />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Les rappels fonctionnent uniquement quand Alafia est ouvert.</p>
            <div className="mt-5 space-y-4">
              {([
                ["notifyMedications", "Rappels de médicaments"],
                ["notifyPregnancy", "Rappels de rendez-vous de grossesse"],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <Label htmlFor={key}>{label}</Label>
                  <Switch id={key} checked={settings[key]} onCheckedChange={(checked) => setSettings({ ...settings, [key]: checked })} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => void enableNotifications()}>Autoriser les notifications</Button>
              <p className="text-xs text-muted-foreground" aria-live="polite">{NOTIFICATION_LABELS[permission]}</p>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <Notice>
            <strong className="font-semibold">Confidentialité.</strong> Le profil et les préférences sont gardés dans le navigateur. Ce stockage local n'est pas un dossier médical sécurisé.
          </Notice>
          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-nature-deep" aria-hidden />
              <h2 className="font-semibold">Vos choix</h2>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <Label htmlFor="personalized-advice">Conseils généraux adaptés à mes réponses</Label>
              <Switch id="personalized-advice" checked={settings.personalizedAdvice} onCheckedChange={(checked) => setSettings({ ...settings, personalizedAdvice: checked })} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Les conseils restent généraux. Ils ne donnent ni diagnostic ni traitement.</p>
          </section>
          <section className="rounded-3xl border border-destructive/20 bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <LockKeyhole className="size-5 text-destructive" aria-hidden />
              <h2 className="font-semibold">Effacer mes données locales</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Supprime les informations Alafia et les documents enregistrés dans ce navigateur.</p>
            <Button type="button" variant="destructive" className="mt-4 w-full" onClick={() => void eraseData()}>
              <Trash2 />
              Tout effacer
            </Button>
          </section>
        </aside>
      </div>
    </>
  );
}
