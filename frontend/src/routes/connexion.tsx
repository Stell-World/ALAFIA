import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { PageHeader } from "@/components/alafia/PageHeader";
import { Notice } from "@/components/alafia/Notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/professional-api";

export const Route = createFileRoute("/connexion")({ component: SignInPage });
function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { user } = await signIn(email, password);
      const path =
        user.role === "ADMIN"
          ? "/administration/verifications"
          : user.role === "PROFESSIONAL"
            ? "/espace-professionnel"
            : "/profil";
      window.location.assign(path);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        icon={LockKeyhole}
        eyebrow="Connexion"
        title="Accéder à mon espace"
        description="La session est gérée par le service d’authentification Alafia."
      />
      <div className="container-page max-w-xl py-8">
        <form
          onSubmit={(e) => void submit(e)}
          className="space-y-5 rounded-3xl border border-border/70 bg-card p-6 shadow-card md:p-8"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Connexion…" : "Se connecter"}
          </Button>
          <Notice>
            Alafia ne conserve pas le mot de passe dans le navigateur. La connexion nécessite une
            API configurée avec session sécurisée.
          </Notice>
          <p className="text-sm">
            Pas encore de compte ?{" "}
            <a href="/inscription" className="font-semibold text-primary underline">
              Créer un compte
            </a>
          </p>
        </form>
      </div>
    </>
  );
}
