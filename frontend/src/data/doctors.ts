export type Professional = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  facility: string;
  availability: string;
  languages: string[];
};

/** Fictional demo profiles — not real people or facilities. */
export const PROFESSIONALS: Professional[] = [
  { id: "1", name: "Dr Afi Mensah", specialty: "Médecine générale", city: "Lomé", facility: "Centre de santé (démo) Bè", availability: "Lun – Ven, 8h – 16h", languages: ["Français", "Éwé"] },
  { id: "2", name: "Kossi Agbéko", specialty: "Sage-femme", city: "Lomé", facility: "Maternité (démo) Adidogomé", availability: "Tous les jours", languages: ["Français", "Éwé", "Mina"] },
  { id: "3", name: "Dr Essi Lawson", specialty: "Pédiatrie", city: "Kara", facility: "Clinique (démo) Kara Centre", availability: "Mar – Sam, 9h – 17h", languages: ["Français", "Kabiyè"] },
  { id: "4", name: "Dr Yao Dossou", specialty: "Gynécologie", city: "Sokodé", facility: "Hôpital (démo) de Sokodé", availability: "Lun, Mer, Ven", languages: ["Français", "Tem"] },
  { id: "5", name: "Ama Kpodar", specialty: "Infirmerie", city: "Atakpamé", facility: "Dispensaire (démo) Atakpamé", availability: "Lun – Sam, 7h – 15h", languages: ["Français", "Éwé"] },
  { id: "6", name: "Dr Komlan Amegah", specialty: "Médecine générale", city: "Kpalimé", facility: "Centre médical (démo) Kpalimé", availability: "Lun – Ven, 8h – 18h", languages: ["Français", "Éwé"] },
  { id: "7", name: "Dr Massan Tchalla", specialty: "Pédiatrie", city: "Lomé", facility: "Clinique (démo) Tokoin", availability: "Lun – Ven, 10h – 18h", languages: ["Français", "Anglais"] },
  { id: "8", name: "Abla Sossou", specialty: "Sage-femme", city: "Dapaong", facility: "Maternité (démo) Dapaong", availability: "Tous les jours", languages: ["Français", "Moba"] },
];

export const SPECIALTIES = Array.from(new Set(PROFESSIONALS.map((p) => p.specialty))).sort();

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function filterProfessionals(list: Professional[], query: string, specialty: string | null) {
  const q = normalize(query);
  return list.filter((p) => {
    if (specialty && p.specialty !== specialty) return false;
    if (!q) return true;
    return [p.name, p.specialty, p.city, p.facility].some((f) => normalize(f).includes(q));
  });
}

