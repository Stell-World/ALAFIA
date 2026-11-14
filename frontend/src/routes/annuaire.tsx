import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/alafia/PageHeader";

export const Route = createFileRoute("/annuaire")({ component: AnnuaireRedirectPage });

/** Legacy route: the standalone directory was removed until a verified source exists. */
function AnnuaireRedirectPage() {
  return <><PageHeader icon={Building2} eyebrow="Orientation santé" title="Trouver un centre de santé" description="Alafia n’affiche que des établissements issus d’une source vérifiée." /><main className="container-page py-8"><section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft"><p className="leading-relaxed text-muted-foreground">Aucun annuaire fiable de professionnels n’est encore connecté. Les profils de démonstration ne sont pas proposés comme de vrais professionnels.</p><a href="/#centres" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">Voir la recherche de centres sur l’accueil</a><p className="mt-4 text-sm"><a href="/assistant" className="text-primary underline">Poser une question à l’assistant</a></p></section></main></>;
}
