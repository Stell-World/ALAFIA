import { Link } from "@tanstack/react-router";

import { NAV_ITEMS } from "@/lib/nav";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr]">
        <div className="max-w-md space-y-4">
          <Logo tone="light" />
          <p className="text-sm leading-relaxed text-on-dark-muted">
            Alafia fournit des informations générales de santé. Elles ne remplacent jamais l'avis,
            le diagnostic ou le traitement d'un professionnel de santé. En cas d'urgence, rendez-vous
            au centre de santé le plus proche.
          </p>
        </div>
        <nav aria-label="Liens du pied de page">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-on-dark-muted transition-colors hover:text-primary-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-primary-foreground/15">
        <p className="container-page py-5 text-xs text-on-dark-muted">
          © {new Date().getFullYear()} Alafia — Projet de démonstration.
        </p>
      </div>
    </footer>
  );
}

