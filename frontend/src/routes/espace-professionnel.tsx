import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck, BriefcaseMedical, Clock3, FileCheck2, Save, ShieldAlert } from "lucide-react";
import { Notice } from "@/components/alafia/Notice";
import { PageHeader } from "@/components/alafia/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getProfessionalDashboard,
  updateProfessionalProfile,
  type VerificationRequest,
  type VerificationStatus,
} from "@/lib/professional-api";

export const Route = createFileRoute("/espace-professionnel")({ component: ProfessionalDashboard });
const STATUS: Record<VerificationStatus, { label: string; description: string }> = {
  PENDING_VERIFICATION: {
    label: "En attente de vérification",
    description:
      "Votre dossier a été reçu. Un administrateur habilité doit vérifier les informations et justificatifs.",
  },
  VERIFIED: {
    label: "Profil vérifié",
    description: "Votre profil peut être référencé selon les critères de recherche disponibles.",
  },
  REJECTED: {
    label: "Demande rejetée",
    description: "Consultez les informations communiquées par l’équipe de vérification.",
  },
  ADDITIONAL_INFORMATION_REQUIRED: {
    label: "Informations complémentaires requises",
    description: "Fournissez les pièces ou précisions demandées pour poursuivre l’examen.",
  },
  SUSPENDED: {
    label: "Profil temporairement suspendu",
    description:
      "Votre profil n’est pas proposé pendant la suspension. Contactez l’administration pour en connaître le motif.",
  },
};
function ProfessionalDashboard() {
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ facility: "", city: "", address: "", presentation: "" });
  async function load() {
    setBusy(true);
    setError("");
    try {
      const result = await getProfessionalDashboard();
      setRequest(result.request);
      setForm({
        facility: result.request.facility,
        city: result.request.city,
        address: result.request.address,
        presentation: result.request.presentation,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de charger votre espace.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaved(false);
    try {
      const result = await updateProfessionalProfile(form);
      setRequest(result.request);
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Enregistrement impossible.");
    }
  }
  return (
    <>
      <PageHeader
        icon={BriefcaseMedical}
        eyebrow="Espace professionnel"
        title="Mon profil professionnel"
        description="Consultez votre statut et gérez les informations de votre profil."
      />
      <div className="container-page max-w-4xl space-y-5 py-8">
        {busy && (
          <p role="status" className="rounded-2xl bg-mint-soft p-5">
            Chargement de votre dossier…
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="space-y-3 rounded-2xl border border-destructive/25 bg-card p-5 text-sm text-destructive"
          >
            <p>{error}</p>
            <Button variant="outline" onClick={() => void load()}>
              Réessayer
            </Button>
          </div>
        )}
        {request && (
          <>
            <section className="rounded-3xl bg-nature-gradient p-6 text-primary-foreground shadow-card md:p-8">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15">
                  {request.status === "VERIFIED" ? (
                    <BadgeCheck />
                  ) : request.status === "SUSPENDED" || request.status === "REJECTED" ? (
                    <ShieldAlert />
                  ) : (
                    <Clock3 />
                  )}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-dark-muted">
                    Statut communiqué par le serveur
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{STATUS[request.status].label}</h2>
                  <p className="mt-2 text-sm text-on-dark-muted">
                    {STATUS[request.status].description}
                  </p>
                </div>
              </div>
              {request.status === "PENDING_VERIFICATION" && (
                <ol className="mt-6 grid gap-2 text-sm sm:grid-cols-3">
                  <li className="rounded-xl bg-primary-foreground/10 p-3">1. Dossier reçu</li>
                  <li className="rounded-xl bg-primary-foreground/10 p-3">
                    2. Vérification des justificatifs
                  </li>
                  <li className="rounded-xl bg-primary-foreground/10 p-3">
                    3. Décision et notification
                  </li>
                </ol>
              )}
              {request.requestedInformation && (
                <div className="mt-4 rounded-xl bg-primary-foreground/10 p-4">
                  <strong>Compléments demandés</strong>
                  <p className="mt-1 text-sm">{request.requestedInformation}</p>
                </div>
              )}
            </section>
            <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
              <h2 className="text-lg font-semibold">Dossier soumis</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {request.firstName} {request.lastName} · {request.specialty} · soumis le{" "}
                {new Date(request.submittedAt).toLocaleDateString("fr-FR")}
              </p>
              <ul className="mt-4 space-y-2">
                {request.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2 text-sm">
                    <FileCheck2 className="size-4 text-nature-deep" />
                    {doc.name} <span className="text-muted-foreground">· {doc.category}</span>
                  </li>
                ))}
              </ul>
            </section>
            <form
              onSubmit={(e) => void save(e)}
              className="space-y-4 rounded-3xl border border-border/70 bg-card p-6 shadow-soft"
            >
              <h2 className="text-lg font-semibold">Coordonnées professionnelles</h2>
              <p className="text-sm text-muted-foreground">
                Les changements sensibles peuvent entraîner une nouvelle vérification selon la
                réponse du service.
              </p>
              <Field
                id="facility"
                label="Établissement"
                value={form.facility}
                onChange={(v) => setForm({ ...form, facility: v })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="city"
                  label="Ville"
                  value={form.city}
                  onChange={(v) => setForm({ ...form, city: v })}
                />
                <Field
                  id="address"
                  label="Adresse professionnelle"
                  value={form.address}
                  onChange={(v) => setForm({ ...form, address: v })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presentation">Présentation professionnelle</Label>
                <Textarea
                  id="presentation"
                  rows={3}
                  value={form.presentation}
                  onChange={(e) => setForm({ ...form, presentation: e.target.value })}
                />
              </div>
              {saved && (
                <p role="status" className="text-sm text-nature-deep">
                  Modifications enregistrées.
                </p>
              )}
              <Button type="submit">
                <Save /> Enregistrer
              </Button>
            </form>
            <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
              <h2 className="font-semibold">Historique de vérification</h2>
              <ol className="mt-4 space-y-3">
                {request.history.map((item, index) => (
                  <li key={`${item.at}-${index}`} className="border-l-2 border-mint pl-4">
                    <p className="font-medium">{STATUS[item.status]?.label ?? item.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.at).toLocaleString("fr-FR")} · {item.actor}
                    </p>
                    {item.note && <p className="mt-1 text-sm">{item.note}</p>}
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}
        {!busy && !request && !error && (
          <Notice>Aucun dossier professionnel n’est associé à ce compte.</Notice>
        )}
      </div>
    </>
  );
}
function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
