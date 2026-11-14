export const PROFILE_KEY = "alafia.profil.v1";
export const SETTINGS_KEY = "alafia.reglages.v1";

/** Only what is useful; every field is optional. */
export type Profile = {
  photo: string | null; // small resized data URL, stays on the device
  firstName: string;
  lastName: string;
  birthDate: string;
  sex: "" | "femme" | "homme" | "autre" | "non-precise";
  city: string;
  location: string;
  sharedHealth: string;
};

export const EMPTY_PROFILE: Profile = {
  photo: null,
  firstName: "",
  lastName: "",
  birthDate: "",
  sex: "",
  city: "",
  location: "",
  sharedHealth: "",
};

export type Settings = {
  notifyMedications: boolean;
  notifyPregnancy: boolean;
  personalizedAdvice: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  notifyMedications: true,
  notifyPregnancy: true,
  personalizedAdvice: true,
};

export const SEX_OPTIONS: { value: Exclude<Profile["sex"], "">; label: string }[] = [
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "autre", label: "Autre" },
];

/** Resizes a picked photo so it fits comfortably in device storage. */
export function resizeImage(file: File, max = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible"));
    };
    img.src = url;
  });
}
