import { createFileRoute } from "@tanstack/react-router";
import {
  Apple,
  Baby,
  CalendarHeart,
  HeartHandshake,
  Siren,
  Sprout,
  type LucideIcon,
} from "lucide-react";

import { Notice } from "@/components/alafia/Notice";
import { PregnancyTracker } from "@/components/alafia/PregnancyTracker";
import { PageHeader } from "@/components/alafia/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/grossesse")({
  head: () => ({
    meta: [
      { title: "Grossesse et santé reproductive — Alafia" },
      {
        name: "description",
        content:
          "Conseils généraux pour préparer, vivre et suivre sa grossesse, et pour la santé reproductive.",
      },
      { property: "og:title", content: "Grossesse et santé reproductive — Alafia" },
      {
        property: "og:description",
        content: "Des repères clairs et bienveillants, de la préparation à l'après-accouchement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GrossessePage,
});

type Section = { id: string; icon: LucideIcon; title: string; intro: string; tips: string[] };

const SECTIONS: Section[] = [
  {
    id: "preparer",
    icon: Sprout,
    title: "Préparer une grossesse",
    intro: "Un projet de grossesse se prépare idéalement avec un professionnel de santé.",
    tips: [
      "Faites un bilan de santé avant de concevoir si possible.",
      "Demandez conseil sur la supplémentation adaptée à votre situation.",
      "Vérifiez votre carnet de vaccination avec le centre de santé.",
      "Limitez le tabac, l'alcool et l'automédication.",
    ],
  },
  {
    id: "suivi",
    icon: CalendarHeart,
    title: "Les consultations prénatales",
    intro: "Le suivi régulier permet de veiller à votre santé et à celle de votre bébé.",
    tips: [
      "Consultez dès que vous pensez être enceinte.",
      "Respectez les rendez-vous fixés par la sage-femme ou le médecin.",
      "Gardez votre carnet de grossesse et apportez-le à chaque visite.",
      "N'hésitez pas à poser toutes vos questions.",
    ],
  },
  {
    id: "alimentation",
    icon: Apple,
    title: "Alimentation et bien-être",
    intro: "Une alimentation variée et du repos aident à bien vivre la grossesse.",
    tips: [
      "Mangez varié : légumes, fruits, céréales, légumineuses, protéines.",
      "Buvez régulièrement de l'eau potable.",
      "Dormez sous une moustiquaire imprégnée.",
      "Pratiquez une activité douce, comme la marche, si elle vous convient.",
    ],
  },
  {
    id: "alerte",
    icon: Siren,
    title: "Signes qui doivent faire consulter",
    intro: "Certains signes nécessitent de se rendre rapidement dans un centre de santé.",
    tips: [
      "Saignements ou pertes de liquide.",
      "Fièvre, maux de tête intenses ou troubles de la vue.",
      "Douleurs abdominales fortes ou contractions précoces.",
      "Gonflement soudain du visage ou des mains, ou bébé qui bouge moins.",
    ],
  },
  {
    id: "apres",
    icon: Baby,
    title: "Après l'accouchement",
    intro: "Les semaines qui suivent la naissance comptent aussi pour la maman.",
    tips: [
      "Allez aux consultations post-natales prévues.",
      "Reposez-vous et acceptez l'aide de vos proches.",
      "Parlez de votre moral : la fatigue et la tristesse peuvent se soigner.",
      "Demandez conseil pour l'allaitement si besoin.",
    ],
  },
  {
    id: "reproductive",
    icon: HeartHandshake,
    title: "Santé reproductive",
    intro: "Chacun a le droit à une information claire et confidentielle.",
    tips: [
      "Informez-vous sur les méthodes de planification familiale.",
      "Le choix d'une méthode se fait avec un professionnel de santé.",
      "Le préservatif protège aussi des infections sexuellement transmissibles.",
      "Les centres de santé proposent des consultations confidentielles.",
    ],
  },
];

function GrossessePage() {
  return (
    <>
      <PageHeader
        icon={Baby}
        eyebrow="Grossesse"
        title="Grossesse et santé reproductive"
        description="Des conseils généraux pour vous accompagner à chaque étape. Votre sage-femme ou votre médecin reste votre référence."
      />
      <div className="container-page grid grid-cols-1 gap-8 py-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Sections" className="lg:sticky lg:top-28 lg:h-fit">
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:px-0">
            {SECTIONS.map((s) => (
              <li key={s.id} className="shrink-0">
                <a
                  href={`/grossesse-etape/${s.id}`}
                  className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary lg:rounded-xl lg:border-transparent lg:bg-transparent"
                >
                  <s.icon className="size-4 text-nature-deep" aria-hidden />
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-5">
          {SECTIONS.map((s, i) => (
            <a
              key={s.id}
              href={`/grossesse-etape/${s.id}`}
              id={s.id}
              className={
                s.id === "alerte"
                  ? "block min-w-0 scroll-mt-28 rounded-3xl bg-nature-gradient p-6 text-primary-foreground shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-8"
                  : "block min-w-0 scroll-mt-28 rounded-3xl border border-border/70 bg-card p-6 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-8"
              }
            >
              <div className="flex items-start gap-4">
                <span
                  className={
                    s.id === "alerte"
                      ? "grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-foreground/15"
                      : "grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary"
                  }
                >
                  <s.icon className="size-6" aria-hidden />
                </span>
                <div>
                  <p
                    className={
                      s.id === "alerte"
                        ? "text-xs font-semibold uppercase tracking-wider text-on-dark-muted"
                        : "text-xs font-semibold uppercase tracking-wider text-nature-deep"
                    }
                  >
                    Étape {i + 1}
                  </p>
                  <h2
                    className={
                      s.id === "alerte"
                        ? "mt-1 text-xl font-semibold text-primary-foreground md:text-2xl"
                        : "mt-1 text-xl font-semibold md:text-2xl"
                    }
                  >
                    {s.title}
                  </h2>
                  <p
                    className={
                      s.id === "alerte"
                        ? "mt-2 text-base text-on-dark-muted"
                        : "mt-2 text-muted-foreground"
                    }
                  >
                    {s.intro}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {s.tips.map((t) => (
                  <p
                    key={t}
                    className={
                      s.id === "alerte"
                        ? "rounded-2xl bg-primary-foreground/10 p-4 text-base leading-relaxed"
                        : "flex gap-3 rounded-2xl bg-mint-soft p-4 text-sm leading-relaxed"
                    }
                  >
                    {s.id !== "alerte" && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-nature" aria-hidden />
                    )}
                    {t}
                  </p>
                ))}
              </div>
              <span className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
                Découvrir cette étape →
              </span>
            </a>
          ))}
          <section id="mon-suivi" className="scroll-mt-28 space-y-5">
            <div className="rounded-3xl bg-nature-gradient p-6 text-primary-foreground md:p-8">
              <h2 className="text-xl font-semibold">Un suivi adapté à votre rythme</h2>
              <p className="mt-2 text-on-dark-muted">
                Gardez vos dates, rendez-vous, notes et documents sur cet appareil.
              </p>
              <Button asChild variant="secondary" className="mt-4">
                <a href="#suivi-grossesse">Créer ou gérer mon suivi</a>
              </Button>
            </div>
            <div id="suivi-grossesse">
              <PregnancyTracker />
            </div>
          </section>
          <Notice>
            Ces contenus sont éducatifs et généraux. Ils ne remplacent pas le suivi par une
            sage-femme, un médecin ou un agent de santé.
          </Notice>
        </div>
      </div>
    </>
  );
}
