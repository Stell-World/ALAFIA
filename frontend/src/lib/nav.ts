import {
  Baby,
  HeartPulse,
  House,
  MessageCircleHeart,
  Syringe,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  to: "/" | "/assistant" | "/suivi" | "/grossesse" | "/vaccination" | "/profil" | "/abonnement";
  label: string;
  short: string;
  description: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Accueil", short: "Accueil", description: "", icon: House },
  {
    to: "/assistant",
    label: "Assistant IA",
    short: "Assistant",
    description: "Posez vos questions de santé et recevez des informations claires.",
    icon: MessageCircleHeart,
  },
  {
    to: "/suivi",
    label: "Mon suivi",
    short: "Suivi",
    description: "Notez vos mesures (poids, tension…) et gardez un historique.",
    icon: HeartPulse,
  },
  {
    to: "/grossesse",
    label: "Grossesse",
    short: "Grossesse",
    description: "Conseils et repères pour la grossesse et la santé reproductive.",
    icon: Baby,
  },
  {
    to: "/vaccination",
    label: "Vaccination",
    short: "Vaccins",
    description: "Comprendre la vaccination et le suivi de santé des enfants.",
    icon: Syringe,
  },
  {
    to: "/profil",
    label: "Mon profil",
    short: "Profil",
    description: "Gérez les informations que vous souhaitez conserver sur cet appareil.",
    icon: UserRound,
  },
];

