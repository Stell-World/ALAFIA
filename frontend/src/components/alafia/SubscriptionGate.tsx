import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionStatus } from "@/lib/use-subscription-status";

export function SubscriptionGate({ children, feature }: { children: ReactNode; feature: string }) {
  const { loading, error, active } = useSubscriptionStatus();
  if (loading) return <div role="status" className="rounded-2xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">Vérification de votre abonnement…</div>;
  if (!active) {
    return <section className="rounded-3xl border border-mint bg-card p-6 shadow-soft md:p-8"><span className="grid size-11 place-items-center rounded-xl bg-mint-soft text-primary"><LockKeyhole /></span><h2 className="mt-4 text-lg font-semibold">{feature} avec l’abonnement Standard</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{error ? "Nous ne pouvons pas vérifier votre abonnement actuellement. L’accès reste verrouillé jusqu’à confirmation du service." : "Passez à la formule Standard pour accéder à cette fonction approfondie du suivi."}</p><Button asChild className="mt-4"><a href="/abonnement">Voir l’abonnement à 15 000 FCFA</a></Button></section>;
  }
  return <>{children}</>;
}
