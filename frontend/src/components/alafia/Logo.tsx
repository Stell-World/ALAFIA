import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

export function Logo({ tone = "default" }: { tone?: "default" | "light" }) {
  const light = tone === "light";
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Alafia, accueil">
      <span
        className={
          light
            ? "grid size-10 place-items-center rounded-2xl bg-primary-foreground/15 text-primary-foreground"
            : "grid size-10 place-items-center rounded-2xl bg-nature-gradient text-primary-foreground shadow-soft"
        }
      >
        <Leaf className="size-5" strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={
            light
              ? "font-display text-xl font-semibold text-primary-foreground"
              : "font-display text-xl font-semibold text-primary"
          }
        >
          Alafia
        </span>
        <span
          className={
            light
              ? "mt-1 text-[11px] font-medium text-on-dark-muted"
              : "mt-1 text-[11px] font-medium text-nature-deep"
          }
        >
          Votre santé, à chaque étape.
        </span>
      </span>
    </Link>
  );
}

