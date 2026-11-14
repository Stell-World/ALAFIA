import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, FileText, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { PageHeader } from "@/components/alafia/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  decideVerification,
  listVerificationRequests,
  type VerificationRequest,
  type VerificationStatus,
} from "@/lib/professional-api";

export const Route = createFileRoute("/administration/verifications")({
  component: VerificationAdmin,
});
const FILTERS: { id: VerificationStatus; label: string }[] = [
  { id: "PENDING_VERIFICATION", label: "En attente" },
  { id: "ADDITIONAL_INFORMATION_REQUIRED", label: "Compléments demandés" },
  { id: "VERIFIED", label: "Vérifiés" },
  { id: "REJECTED", label: "Rejetés" },
  { id: "SUSPENDED", label: "Suspendus" },
];
function VerificationAdmin() {
  const [status, setStatus] = useState<VerificationStatus>("PENDING_VERIFICATION");
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selected, setSelected] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(
    async (next: VerificationStatus = status) => {
      setBusy(true);
      setError("");
      try {
        const result = await listVerificationRequests(next);
        setRequests(result.requests);
        setSelected("");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Impossible de charger les dossiers.");
      } finally {
        setBusy(false);
      }
    },
    [status],
  );
  useEffect(() => {
    void load(status);
  }, [load, status]);
  async function decide(
    request: VerificationRequest,
    action: "verify" | "reject" | "request-information" | "suspend",
  ) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await decideVerification(request.id, action, notes[request.id] ?? "");
      setMessage("Décision enregistrée. L’historique officiel est géré par le serveur.");
      await load(status);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La décision n’a pas pu être enregistrée.");
      setBusy(false);
    }
  }
  const current = requests.find((item) => item.id === selected);
  return (
    <>
      <PageHeader
        icon={ShieldCheck}
        eyebrow="Administration habilitée"
        title="Vérification des professionnels"
        description="Les dossiers et décisions sont accessibles uniquement après authentification et autorisation côté serveur."
      />
      <div className="container-page space-y-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <Button
                key={filter.id}
                variant={status === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={busy}>
            <RefreshCw /> Actualiser
          </Button>
        </div>
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/25 bg-card p-4 text-sm text-destructive"
          >
            {error}
          </div>
        )}
        {message && (
          <p role="status" className="rounded-xl bg-mint-soft p-3 text-sm text-primary">
            {message}
          </p>
        )}
        {busy && (
          <p role="status" className="text-sm text-muted-foreground">
            Chargement sécurisé des dossiers…
          </p>
        )}
        <div className="grid gap-5 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)]">
          <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
            <h2 className="font-semibold">Demandes ({requests.length})</h2>
            {requests.length ? (
              <ul className="mt-4 space-y-2">
                {requests.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setSelected(item.id)}
                      className={`w-full rounded-2xl border p-4 text-left ${selected === item.id ? "border-nature bg-mint-soft" : "border-border/70 hover:bg-muted/40"}`}
                    >
                      <span className="block font-semibold">
                        {item.firstName} {item.lastName}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {item.specialty} · {item.city}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Reçu le {new Date(item.submittedAt).toLocaleDateString("fr-FR")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              !busy && (
                <p className="mt-4 rounded-xl bg-mint-soft p-4 text-sm text-muted-foreground">
                  Aucune demande dans ce statut.
                </p>
              )
            )}
          </section>
          <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
            {current ? (
              <>
                <h2 className="text-xl font-semibold">
                  {current.firstName} {current.lastName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {current.specialty} · {current.professionalId || "Identifiant non indiqué"}
                </p>
                <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ["E-mail", current.email],
                    ["Téléphone", current.phone],
                    ["Établissement", current.facility],
                    ["Ville", current.city],
                    ["Adresse", current.address],
                    [
                      "Expérience",
                      current.experience == null ? "Non renseignée" : `${current.experience} ans`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="font-medium">{value || "Non renseigné"}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5">
                  <h3 className="font-semibold">Présentation</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                    {current.presentation || "Aucune présentation fournie."}
                  </p>
                </div>
                <div className="mt-5">
                  <h3 className="font-semibold">Justificatifs privés</h3>
                  <ul className="mt-2 space-y-2">
                    {current.documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex flex-wrap items-center gap-2 rounded-xl bg-mint-soft p-3 text-sm"
                      >
                        <FileText className="size-4" />
                        {doc.name} · {doc.category}
                        {doc.downloadUrl && (
                          <a
                            href={doc.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-auto font-medium text-primary underline"
                          >
                            Ouvrir le document
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Les liens de document doivent être délivrés par le serveur à un administrateur
                    autorisé et expirer rapidement.
                  </p>
                </div>
                <div className="mt-5 space-y-2">
                  <Label htmlFor="internal-note">
                    Note de vérification (enregistrée par le backend dans l’historique)
                  </Label>
                  <Textarea
                    id="internal-note"
                    rows={3}
                    value={notes[current.id] ?? ""}
                    onChange={(e) => setNotes({ ...notes, [current.id]: e.target.value })}
                    placeholder="Sources consultées, éléments contrôlés ou pièces à fournir"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button disabled={busy} onClick={() => void decide(current, "verify")}>
                    <BadgeCheck /> Valider
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => void decide(current, "request-information")}
                  >
                    Demander des compléments
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={busy}
                    onClick={() =>
                      void decide(current, current.status === "VERIFIED" ? "suspend" : "reject")
                    }
                  >
                    <XCircle />
                    {current.status === "VERIFIED" ? "Suspendre" : "Rejeter"}
                  </Button>
                </div>
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-semibold">Historique des décisions</h3>
                  <ol className="mt-3 space-y-2">
                    {current.history.map((decision, index) => (
                      <li key={`${decision.at}-${index}`} className="text-sm">
                        <strong>{decision.status}</strong>
                        <span className="text-muted-foreground">
                          {" "}
                          · {new Date(decision.at).toLocaleString("fr-FR")} · {decision.actor}
                        </span>
                        {decision.note && <p>{decision.note}</p>}
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sélectionnez un dossier pour examiner les informations et les pièces.
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
