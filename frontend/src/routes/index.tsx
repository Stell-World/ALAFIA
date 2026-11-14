import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HandHeart, Lock, MessageCircleHeart, ShieldCheck, Sparkles } from "lucide-react";

import heroImage from "@/assets/alafia-hero.jpg";
import { SectionTitle } from "@/components/alafia/Notice";
import { NearbyCenters } from "@/components/alafia/NearbyCenters";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alafia — Votre santé, à chaque étape" },
      {
        name: "description",
        content:
          "Informations santé fiables, assistant IA, suivi personnel, grossesse, vaccination et annuaire médical au Togo.",
      },
      { property: "og:title", content: "Alafia — Votre santé, à chaque étape" },
      {
        property: "og:description",
        content: "Une plateforme douce et rassurante pour s'informer et prendre soin de sa santé.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FEATURES = NAV_ITEMS.filter((item) => item.to !== "/");

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Informations fiables",
    text: "Des contenus clairs, rédigés simplement, pour mieux comprendre sa santé.",
  },
  {
    icon: HandHeart,
    title: "Accompagnement bienveillant",
    text: "De la grossesse à l'enfance, des repères à chaque étape de la vie.",
  },
  {
    icon: Lock,
    title: "Vos données restent chez vous",
    text: "Votre suivi personnel est enregistré uniquement sur votre appareil.",
  },
];

function Index() {
  return (
    <>
      {/* Accueil */}
      <section className="relative overflow-hidden bg-hero">
        <div className="container-page grid items-center gap-10 py-10 md:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="space-y-7 animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-sm font-medium text-nature-deep shadow-soft">
              <Sparkles className="size-4" aria-hidden />
              Votre santé, à chaque étape.
            </span>
            <h1 className="text-4xl font-semibold leading-[1.1] md:text-5xl xl:text-6xl">
              Prendre soin de soi et de sa famille,{" "}
              <span className="text-nature-deep">en toute sérénité.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Alafia vous aide à comprendre votre santé avec des informations claires, un assistant
              disponible à tout moment et des outils simples pour suivre votre quotidien.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/assistant">
                  <MessageCircleHeart />
                  Parler à l'assistant
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/suivi">
                  Commencer mon suivi
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl animate-fade-up [animation-delay:120ms]">
            <div className="absolute -inset-4 -z-0 rounded-[2.5rem] bg-mint/50 rotate-3" aria-hidden />
            <img
              src={heroImage}
              alt="Une mère et son bébé échangent avec une agente de santé souriante"
              width={1280}
              height={1024}
              className="relative aspect-[5/4] w-full rounded-[2rem] object-cover shadow-lift"
            />
            <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-card sm:left-8">
              <span className="grid size-10 place-items-center rounded-xl bg-nature text-nature-foreground">
                <HandHeart className="size-5" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-primary">Pensé pour le Togo</p>
                <p className="text-xs text-muted-foreground">Simple, gratuit, accessible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accès rapide */}
      <section className="container-page py-16 md:py-20">
        <SectionTitle
          eyebrow="Accès rapide"
          title="Tout ce qu'il faut pour votre santé, au même endroit"
          description="Choisissez une rubrique pour commencer."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item, i) => (
            <li key={item.to} className={i === 0 ? "lg:row-span-2" : ""}>
              <Link
                to={item.to}
                className={
                  i === 0
                    ? "group flex h-full flex-col justify-between gap-8 rounded-3xl bg-nature-gradient p-7 text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
                    : "group flex h-full flex-col gap-4 rounded-3xl border border-border/70 bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-mint hover:shadow-card"
                }
              >
                <span
                  className={
                    i === 0
                      ? "grid size-14 place-items-center rounded-2xl bg-primary-foreground/15"
                      : "grid size-12 place-items-center rounded-2xl bg-secondary text-primary"
                  }
                >
                  <item.icon className={i === 0 ? "size-7" : "size-6"} aria-hidden />
                </span>
                <div className="space-y-2">
                  <h3
                    className={
                      i === 0
                        ? "text-2xl font-semibold text-primary-foreground"
                        : "text-lg font-semibold"
                    }
                  >
                    {item.label}
                  </h3>
                  <p
                    className={
                      i === 0
                        ? "text-base leading-relaxed text-on-dark-muted"
                        : "text-sm leading-relaxed text-muted-foreground"
                    }
                  >
                    {item.description}
                  </p>
                </div>
                <span
                  className={
                    i === 0
                      ? "inline-flex items-center gap-2 text-sm font-semibold"
                      : "mt-auto inline-flex items-center gap-2 text-sm font-semibold text-nature-deep"
                  }
                >
                  Découvrir
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <NearbyCenters />

      {/* Services */}
      <section className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-card p-8 shadow-card md:p-12">
          <div className="leaf-pattern pointer-events-none absolute inset-0 opacity-50" aria-hidden />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <SectionTitle
              eyebrow="Nos engagements"
              title="Une plateforme douce, claire et respectueuse"
              description="Alafia informe et oriente. Pour tout diagnostic ou traitement, un professionnel de santé reste votre meilleur interlocuteur."
            />
            <ul className="grid gap-4 sm:grid-cols-3">
              {VALUES.map((v) => (
                <li key={v.title} className="rounded-2xl bg-mint-soft p-5">
                  <span className="grid size-11 place-items-center rounded-xl bg-nature text-nature-foreground">
                    <v.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

