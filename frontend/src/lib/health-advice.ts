import type { HealthInfo, Medication } from "./health-storage";

export type Advice = { id: string; title: string; text: string };

/**
 * General, non-medical tips chosen from what the user shared.
 * They never name a disease, a cause, a dose or a treatment change.
 */
export function getHealthAdvice(info: HealthInfo, meds: Medication[]): Advice[] {
  const tips: Advice[] = [];
  if (info.chronic === "oui") {
    const detail = info.chronicDetail.trim().slice(0, 120);
    tips.push({
      id: "chronic",
      title: detail ? `Votre suivi : ${detail}` : "Gardez un suivi régulier",
      text: "Vous avez indiqué vivre avec une maladie de longue durée. Notez vos questions et les changements que vous souhaitez partager lors de vos rendez-vous avec un professionnel de santé.",
    });
  }
  if (info.pain === "oui") {
    const details = [info.painLocation.trim(), info.painSince.trim(), info.painFrequency.trim()]
      .filter(Boolean)
      .map((value) => value.slice(0, 80));
    tips.push({
      id: "pain",
      title: "Décrivez ce que vous ressentez",
      text: details.length
        ? `Vous avez noté : ${details.join(" · ")}. Vous pouvez noter tout changement et en parler avec un professionnel de santé.`
        : "Notez quand la douleur ou le malaise apparaît et sa durée. Ces notes aideront un professionnel de santé à vous écouter et à vous examiner.",
    });
  }
  if (meds.length > 0) {
    tips.push({
      id: "meds",
      title: "Suivez les indications reçues",
      text: "Prenez vos médicaments comme indiqué par le professionnel qui les a prescrits. Ne modifiez pas un traitement sans son avis, et gardez vos ordonnances.",
    });
  }
  tips.push(
    {
      id: "water",
      title: "Buvez de l'eau potable",
      text: "Buvez régulièrement dans la journée, surtout quand il fait chaud.",
    },
    {
      id: "mosquito",
      title: "Protégez-vous des moustiques",
      text: "Dormez sous une moustiquaire imprégnée et videz les eaux stagnantes autour de la maison.",
    },
    {
      id: "consult",
      title: "Consultez si quelque chose vous inquiète",
      text: "Un symptôme qui dure, s'aggrave ou vous inquiète mérite l'avis d'un professionnel de santé.",
    },
  );
  return tips;
}
