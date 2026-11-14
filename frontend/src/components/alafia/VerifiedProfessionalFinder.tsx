import { useState } from "react";
import { MapPin, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findVerifiedProfessionals, type ProfessionalSummary } from "@/lib/professional-api";

const SPECIALTIES = [
  "Médecine générale",
  "Pédiatrie",
  "Gynécologie-obstétrique",
  "Sage-femme",
  "Infirmier / infirmière",
  "Dentisterie",
  "Ophtalmologie",
  "Autre",
];
export function VerifiedProfessionalFinder() {
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [items, setItems] = useState<ProfessionalSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  async function search() {
    setBusy(true);
    setSearched(false);
    setError("");
    try {
      const result = await findVerifiedProfessionals(specialty, city);
      setItems(result.professionals.filter((item) => item.verified === true));
      setSearched(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La recherche n’est pas disponible.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mt-4 rounded-2xl border border-mint bg-card p-4">
      <h3 className="font-semibold">Recherche de professionnels vérifiés</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Choisissez une spécialité et une ville. Seuls les profils marqués vérifiés par le service
        pourront être affichés.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-1">
          <Label htmlFor="pro-specialty">Spécialité</Label>
          <select
            id="pro-specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Toutes les spécialités</option>
            {SPECIALTIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="pro-city">Ville</Label>
          <Input
            id="pro-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex. Lomé"
          />
        </div>
        <Button className="self-end" onClick={() => void search()} disabled={busy}>
          <Search />
          {busy ? "Recherche…" : "Rechercher"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {searched && !items.length && (
        <p role="status" className="mt-4 rounded-xl bg-mint-soft p-4 text-sm text-muted-foreground">
          Aucun professionnel vérifié correspondant n’est disponible pour ces critères.
        </p>
      )}
      {items.length > 0 && (
        <ul className="mt-4 grid gap-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border/70 p-4">
              <div className="flex items-start gap-3">
                {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt={`Photo de ${item.name}`}
                    className="size-12 rounded-xl object-cover"
                  />
                ) : (
                  <span className="grid size-12 place-items-center rounded-xl bg-mint-soft text-primary">
                    <UserRound />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {item.name}{" "}
                    <span className="ml-1 rounded-full bg-mint-soft px-2 py-0.5 text-xs text-primary">
                      Vérifié
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">{item.specialty}</p>
                  {item.facility && <p className="mt-1 text-sm">{item.facility}</p>}
                  {(item.city || item.address) && (
                    <p className="mt-1 flex gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      {[item.address, item.city].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs">
                    {item.phone && (
                      <a href={`tel:${item.phone}`} className="text-primary underline">
                        {item.phone}
                      </a>
                    )}
                    {item.email && (
                      <a href={`mailto:${item.email}`} className="text-primary underline">
                        {item.email}
                      </a>
                    )}
                    {item.availability && <span>Disponibilités : {item.availability}</span>}
                  </div>
                  <a
                    href={`/professionnels/${encodeURIComponent(item.id)}`}
                    className="mt-3 inline-block text-sm font-semibold text-primary underline"
                  >
                    Consulter le profil
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
