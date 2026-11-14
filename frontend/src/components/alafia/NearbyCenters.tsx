import { useState } from "react";
import { Building2, LocateFixed, MapPin, Navigation, Route as RouteIcon } from "lucide-react";

import { SectionTitle } from "@/components/alafia/Notice";
import { Button } from "@/components/ui/button";
import {
  directionsUrl,
  findNearbyCenters,
  openStreetMapEmbedUrl,
  type Coordinates,
  type HealthCenter,
} from "@/lib/health-centers";

type State = "idle" | "locating" | "ready" | "error";

function errorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return "L'autorisation de localisation a été refusée. Vous pouvez la modifier dans les réglages du navigateur.";
  if (error.code === error.TIMEOUT) return "La localisation a pris trop de temps. Réessayez quand vous aurez une meilleure connexion.";
  return "Votre position n'a pas pu être déterminée sur cet appareil.";
}

function CenterCard({ center, position }: { center: HealthCenter; position: Coordinates }) {
  return (
    <li className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
          <Building2 className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{center.name}</h3>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            {center.address}
          </p>
          <p className="mt-2 text-xs font-medium text-nature-deep">
            {center.distanceKm.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} km
            {center.services?.length ? ` · ${center.services.join(", ")}` : ""}
          </p>
        </div>
      </div>
      <a
        href={directionsUrl(position, center)}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        <RouteIcon className="size-4" aria-hidden />
        Voir l'itinéraire
      </a>
      <p className="mt-2 text-xs text-muted-foreground">Source vérifiée : {center.sourceName}</p>
    </li>
  );
}

export function NearbyCenters() {
  const [state, setState] = useState<State>("idle");
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [centers, setCenters] = useState<HealthCenter[]>([]);
  const [error, setError] = useState("");

  function locate() {
    if (!navigator.geolocation) {
      setState("error");
      setError("La géolocalisation n'est pas disponible dans ce navigateur.");
      return;
    }
    setState("locating");
    setError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const next = { latitude: coords.latitude, longitude: coords.longitude };
        setPosition(next);
        try {
          // A verified provider can be connected here later. No demo facilities are shown.
          setCenters(await findNearbyCenters(next));
          setState("ready");
        } catch {
          setState("error");
          setError("La recherche des établissements n'est pas disponible pour le moment.");
        }
      },
      (reason) => {
        setState("error");
        setError(errorMessage(reason));
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 60_000 },
    );
  }

  return (
    <section id="centres" className="container-page scroll-mt-28 py-14 md:py-18">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="space-y-5">
          <SectionTitle
            eyebrow="À proximité"
            title="Trouver un centre de santé près de moi"
            description="Autorisez la localisation pour afficher votre position sur la carte et rechercher les établissements vérifiés disponibles."
          />
          <Button type="button" size="lg" onClick={locate} disabled={state === "locating"}>
            <LocateFixed />
            {state === "locating" ? "Localisation en cours…" : state === "ready" ? "Actualiser ma position" : "Me localiser"}
          </Button>
          {error && <p role="alert" className="rounded-2xl border border-destructive/20 bg-card p-4 text-sm text-destructive">{error}</p>}
          <p className="text-xs leading-relaxed text-muted-foreground">
            La localisation n'est demandée qu'après votre clic. Si vous l'autorisez, OpenStreetMap reçoit les coordonnées nécessaires à l'affichage de la carte. Alafia ne les enregistre pas.
          </p>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-mint-soft shadow-card">
            {position ? (
              <iframe
                title="Carte OpenStreetMap de votre position"
                src={openStreetMapEmbedUrl(position)}
                className="h-72 w-full border-0 sm:h-80"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="grid min-h-72 place-items-center px-6 py-10 text-center sm:min-h-80">
                <div className="max-w-sm">
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-card text-primary shadow-soft">
                    <MapPin className="size-7" aria-hidden />
                  </span>
                  <p className="mt-4 font-semibold text-primary">La carte s'affichera après votre autorisation</p>
                  <p className="mt-2 text-sm text-muted-foreground">Votre position n'est pas demandée automatiquement.</p>
                </div>
              </div>
            )}
          </div>

          {state === "ready" && centers.length === 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-mint bg-card p-5">
              <Navigation className="mt-0.5 size-5 shrink-0 text-nature-deep" aria-hidden />
              <div>
                <h3 className="font-semibold">Aucun établissement vérifié disponible</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  La source officielle des centres de santé n'est pas encore connectée. Alafia n'affiche donc ni adresse ni itinéraire non vérifiés.
                </p>
              </div>
            </div>
          )}

          {centers.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {centers.map((center) => position && <CenterCard key={center.id} center={center} position={position} />)}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
