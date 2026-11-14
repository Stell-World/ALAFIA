import { createFileRoute } from "@tanstack/react-router";
import { BellRing, BookHeart, Check, Shield, Syringe } from "lucide-react";
import { useState } from "react";

import { Notice, SectionTitle } from "@/components/alafia/Notice";
import { PageHeader } from "@/components/alafia/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vaccination")({
  head: () => ({
    meta: [
      { title: "Vaccination et santé infantile — Alafia" },
      {
        name: "description",
        content: "Comprendre la vaccination et les grandes étapes du suivi de santé de l'enfant.",
      },
      { property: "og:title", content: "Vaccination et santé infantile — Alafia" },
      {
        property: "og:description",
        content: "Des repères éducatifs pour protéger la santé de vos enfants.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VaccinationPage,
});

const STAGES = [
  { title: "À la naissance", text: "Premiers examens du nouveau-né et ouverture du carnet de santé de l'enfant." },
  { title: "Les premiers mois", text: "Visites régulières au centre de santé : vaccins prévus, poids et croissance." },
  { title: "Autour de la première année", text: "Poursuite des vaccinations selon le calendrier officiel et suivi du développement." },
  { title: "La petite enfance", text: "Rappels éventuels, suivi de la croissance, de l'alimentation et du sommeil." },
  { title: "L'âge scolaire et l'adolescence", text: "Certaines vaccinations peuvent être proposées : renseignez-vous auprès des agents de santé." },
];

const REMINDERS = [
  "Conservez précieusement le carnet de santé de votre enfant.",
  "Apportez le carnet à chaque consultation, même pour une autre raison.",
  "Demandez la date du prochain rendez-vous avant de quitter le centre de santé.",
  "Une légère fièvre après un vaccin est fréquente : demandez conseil en cas de doute.",
  "Participez aux campagnes de vaccination annoncées dans votre quartier.",
];

function VaccinationPage() {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <>
      <PageHeader
        icon={Syringe}
        eyebrow="Vaccination"
        title="Vaccination et santé infantile"
        description="La vaccination protège votre enfant contre des maladies graves. Voici les grandes étapes du suivi à connaître."
      />
      <div className="container-page space-y-14 py-10">
        <Notice tone="warning">
          Alafia ne fournit pas de calendrier vaccinal officiel. Pour connaître les vaccins et les
          dates exactes, adressez-vous à votre centre de santé ou au programme national de vaccination.
        </Notice>

        <section className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <SectionTitle
            eyebrow="Étapes du suivi"
            title="Grandir en bonne santé, étape par étape"
            description="Chaque visite au centre de santé est l'occasion de vérifier la croissance et la protection de votre enfant."
          />
          <ol className="relative space-y-4 border-l-2 border-mint pl-8">
            {STAGES.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
                <span className="absolute -left-[3.05rem] top-5 grid size-9 place-items-center rounded-full border-4 border-background bg-primary font-display text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Shield, title: "Pourquoi vacciner ?", text: "Les vaccins aident le corps à se défendre et protègent aussi l'entourage." },
            { icon: BookHeart, title: "Le carnet de santé", text: "Il garde la trace de chaque vaccin et de chaque visite. Gardez-le à l'abri." },
            { icon: Syringe, title: "Gratuité et campagnes", text: "Renseignez-vous auprès du centre de santé sur les vaccins proposés gratuitement." },
          ].map((c) => (
            <div key={c.title} className="rounded-3xl bg-mint-gradient p-6 shadow-soft">
              <span className="grid size-11 place-items-center rounded-xl bg-nature text-nature-foreground">
                <c.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-card md:p-10">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-dark-muted">
                <BellRing className="size-4" aria-hidden /> Rappels informatifs
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-primary-foreground">Les bons réflexes</h2>
            </div>
            <p className="text-sm text-on-dark-muted">
              {done.size}/{REMINDERS.length} lus
            </p>
          </div>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {REMINDERS.map((r, i) => {
              const read = done.has(i);
              return (
                <li key={r}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-pressed={read}
                    className="flex w-full items-start gap-3 rounded-2xl bg-primary-foreground/10 p-4 text-left text-base leading-relaxed transition-colors hover:bg-primary-foreground/15"
                  >
                    <span
                      className={
                        read
                          ? "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-mint text-primary"
                          : "mt-0.5 size-6 shrink-0 rounded-full border-2 border-primary-foreground/50"
                      }
                    >
                      {read && <Check className="size-4" aria-hidden />}
                    </span>
                    <span className={read ? "text-on-dark-muted line-through decoration-mint/70" : ""}>{r}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {done.size > 0 && (
            <Button variant="outline-light" size="sm" className="mt-5" onClick={() => setDone(new Set())}>
              Tout réinitialiser
            </Button>
          )}
        </section>
      </div>
    </>
  );
}

