import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck, CreditCard, LockKeyhole, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/alafia/PageHeader";
import { Notice } from "@/components/alafia/Notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMySubscription, startSubscriptionCheckout, type PaymentMethod, type Subscription } from "@/lib/subscription-api";

export const Route = createFileRoute("/abonnement")({ component: SubscriptionPage });

function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [statusBusy, setStatusBusy] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("mobile_money");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refreshStatus() {
    setStatusBusy(true);
    setStatusError("");
    try { setSubscription(await getMySubscription()); }
    catch (cause) { setStatusError(cause instanceof Error ? cause.message : "Le statut d’abonnement n’a pas pu être chargé."); }
    finally { setStatusBusy(false); }
  }
  useEffect(() => { void refreshStatus(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!accepted) { setError("Confirmez la redirection vers le prestataire de paiement pour continuer."); return; }
    if (method === "mobile_money" && !phoneNumber.trim()) { setError("Saisissez le numéro associé à votre compte Mobile Money."); return; }
    setBusy(true);
    try {
      const result = await startSubscriptionCheckout({
        planId: "standard",
        paymentMethod: method,
        ...(method === "mobile_money" ? { phoneNumber: phoneNumber.trim() } : {}),
      });
      if (result.checkoutUrl) {
        const destination = new URL(result.checkoutUrl, window.location.origin);
        if (destination.protocol !== "https:" && destination.origin !== window.location.origin) {
          throw new Error("Le lien de paiement sécurisé est invalide.");
        }
        window.location.assign(destination.toString());
        return;
      }
      if (result.status === "PENDING") {
        setMessage(result.message || "La demande de paiement a été lancée. Votre accès sera activé après confirmation du prestataire.");
        await refreshStatus();
        return;
      }
      throw new Error("Le service de paiement n’a pas fourni de page de règlement sécurisée.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le paiement n’a pas pu être lancé.");
    } finally { setBusy(false); }
  }

  const active = subscription?.status === "ACTIVE";
  return <>
    <PageHeader icon={CreditCard} eyebrow="Abonnement Alafia" title="Choisissez votre niveau de suivi" description="Commencez gratuitement ou accédez au suivi Standard et à l’orientation vers des professionnels vérifiés." />
    <div className="container-page max-w-5xl space-y-6 py-8">
      {statusBusy && <p role="status" className="rounded-xl bg-mint-soft p-4 text-sm">Vérification de votre abonnement…</p>}
      {statusError && <div role="alert" className="rounded-2xl border border-border/70 bg-card p-4 text-sm"><p>{statusError}</p><Button className="mt-3" size="sm" variant="outline" onClick={() => void refreshStatus()}>Réessayer</Button></div>}
      {subscription && <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-mint-soft text-primary">{active ? <BadgeCheck /> : <LockKeyhole />}</span><div><p className="text-xs text-muted-foreground">Votre statut actuel</p><p className="font-semibold">{active ? `${subscription.planName || "Standard"} actif` : subscription.status === "PENDING" ? "Paiement en attente de confirmation" : subscription.status === "EXPIRED" ? "Abonnement expiré" : "Accès gratuit"}</p></div></div>{subscription.expiresAt && <p className="text-sm text-muted-foreground">Valide jusqu’au {new Date(subscription.expiresAt).toLocaleDateString("fr-FR")}</p>}{subscription.status === "PENDING" && <Button size="sm" variant="outline" onClick={() => void refreshStatus()}>Vérifier le statut</Button>}</section>}

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-nature-deep">Pour commencer</p><h2 className="mt-2 text-2xl font-semibold">Gratuit</h2><p className="mt-2 text-muted-foreground">Les outils essentiels pour suivre votre santé.</p>
          <ul className="mt-5 space-y-3 text-sm"><Benefit>Assistant IA pour des informations générales</Benefit><Benefit>Journal des mesures et repères de grossesse</Benefit><Benefit>Informations générales sur la santé et la vaccination</Benefit></ul>
          {subscription?.status === "FREE" && <p className="mt-5 rounded-xl bg-mint-soft p-3 text-sm font-medium text-primary">Votre formule actuelle</p>}
        </section>
        <section className="rounded-3xl border-2 border-nature bg-card p-6 shadow-card md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-nature-deep">Suivi approfondi</p><h2 className="mt-2 text-2xl font-semibold">Standard</h2><p className="mt-2"><strong className="font-display text-3xl text-primary">15 000 FCFA</strong></p><p className="mt-1 text-sm text-muted-foreground">Une formule d’abonnement.</p>
          <ul className="mt-5 space-y-3 text-sm"><Benefit>Suivi santé plus détaillé et conseils personnalisés</Benefit><Benefit>Gestion des médicaments, rappels et documents médicaux</Benefit><Benefit>Recherche par l’assistant de professionnels vérifiés et accès à leurs coordonnées professionnelles</Benefit></ul>
          {active ? <p className="mt-5 rounded-xl bg-mint-soft p-3 text-sm font-semibold text-primary">Votre formule Standard est active.</p> : <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
            <fieldset className="space-y-2"><legend className="mb-2 text-sm font-semibold">Mode de paiement</legend><label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${method === "mobile_money" ? "border-nature bg-mint-soft/50" : "border-border/70"}`}><input type="radio" name="payment-method" value="mobile_money" checked={method === "mobile_money"} onChange={() => setMethod("mobile_money")} /><Smartphone className="size-5 text-primary" /><span className="text-sm font-medium">Mobile Money</span></label><label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${method === "bank_card" ? "border-nature bg-mint-soft/50" : "border-border/70"}`}><input type="radio" name="payment-method" value="bank_card" checked={method === "bank_card"} onChange={() => setMethod("bank_card")} /><CreditCard className="size-5 text-primary" /><span className="text-sm font-medium">Carte bancaire</span></label></fieldset>
            {method === "mobile_money" && <div className="space-y-2"><Label htmlFor="mobile-money-phone">Numéro Mobile Money</Label><Input id="mobile-money-phone" type="tel" autoComplete="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="Ex. +228 90 00 00 00" required /><p className="text-xs text-muted-foreground">Le prestataire de paiement confirmera l’opérateur disponible.</p></div>}
            {method === "bank_card" && <p className="rounded-xl bg-mint-soft p-3 text-sm text-muted-foreground">Le règlement par carte s’effectuera sur la page sécurisée du prestataire. Alafia ne demande ni ne stocke les numéros de carte.</p>}
            <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground"><input type="checkbox" className="mt-0.5 accent-primary" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>Je comprends que je vais être redirigé vers le prestataire de paiement pour consulter les conditions et confirmer le règlement.</span></label>
            {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}{message && <p role="status" className="rounded-xl bg-mint-soft p-3 text-sm">{message}</p>}
            {statusError && <Notice>Le statut n’a pas pu être vérifié. L’accès Standard ne sera activé qu’après confirmation du service.</Notice>}
            <Button type="submit" size="lg" className="w-full" disabled={busy || !accepted || !subscription || active}>{busy ? "Préparation du paiement…" : method === "mobile_money" ? "Continuer avec Mobile Money" : "Continuer avec ma carte"}</Button>
            <p className="text-center text-xs text-muted-foreground">La durée, le renouvellement et le montant final seront présentés par le prestataire avant confirmation.</p>
          </form>}
        </section>
      </div>
      <Notice><strong className="font-semibold">Confirmation requise.</strong> Le paiement ne suffit pas à ouvrir l’accès : le service Alafia doit confirmer la transaction et le statut de l’abonnement.</Notice>
    </div>
  </>;
}

function Benefit({ children }: { children: string }) { return <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 size-4 shrink-0 text-nature-deep" />{children}</li>; }
