import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, MapPin, UserRound } from "lucide-react";
import { PageHeader } from "@/components/alafia/PageHeader";
import { Button } from "@/components/ui/button";
import { getVerifiedProfessional, type ProfessionalProfile } from "@/lib/professional-api";

export const Route = createFileRoute("/professionnels/$id")({ component: ProfessionalProfilePage });
function ProfessionalProfilePage() {
  const { id } = Route.useParams();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const result = await getVerifiedProfessional(id);
      if (!result.professional.verified)
        throw new Error("Ce profil n’est pas disponible comme professionnel vérifié.");
      setProfile(result.professional);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Profil indisponible.");
    } finally {
      setBusy(false);
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <>
      <PageHeader
        icon={UserRound}
        eyebrow="Professionnel de santé"
        title={profile?.name ?? "Profil professionnel"}
        description="Les informations de cette page proviennent du service des profils vérifiés."
      />
      <main className="container-page max-w-3xl py-8">
        {busy && (
          <p role="status" className="rounded-xl bg-mint-soft p-4">
            Chargement du profil…
          </p>
        )}
        {error && (
          <div role="alert" className="rounded-2xl border border-border/70 bg-card p-6">
            <p>{error}</p>
            <Button className="mt-4" variant="outline" onClick={() => void load()}>
              Réessayer
            </Button>
          </div>
        )}
        {profile && (
          <article className="rounded-3xl border border-border/70 bg-card p-6 shadow-card md:p-8">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={`Photo professionnelle de ${profile.name}`}
                className="size-24 rounded-2xl object-cover"
              />
            ) : (
              <span className="grid size-24 place-items-center rounded-2xl bg-mint-soft text-primary">
                <UserRound className="size-10" />
              </span>
            )}
            <h2 className="mt-5 flex items-center gap-2 text-2xl font-semibold">
              {profile.name}
              <BadgeCheck className="size-5 text-nature-deep" aria-label="Profil vérifié" />
            </h2>
            <p className="mt-1 font-medium text-primary">{profile.specialty}</p>
            {profile.facility && <p className="mt-4">{profile.facility}</p>}
            {(profile.city || profile.address) && (
              <p className="mt-2 flex gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                {[profile.address, profile.city].filter(Boolean).join(", ")}
              </p>
            )}
            {profile.presentation && (
              <div className="mt-5">
                <h3 className="font-semibold">Présentation</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {profile.presentation}
                </p>
              </div>
            )}
            {profile.experience != null && (
              <p className="mt-4 text-sm">Expérience : {profile.experience} ans</p>
            )}
            {profile.availability && (
              <p className="mt-2 text-sm">Disponibilités : {profile.availability}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Appeler
                </a>
              )}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold text-primary"
                >
                  Envoyer un e-mail
                </a>
              )}
            </div>
          </article>
        )}
      </main>
    </>
  );
}
