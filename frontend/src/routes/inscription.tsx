import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, BriefcaseMedical, FileCheck2, UserRound, X } from "lucide-react";
import { PageHeader } from "@/components/alafia/PageHeader";
import { Notice } from "@/components/alafia/Notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ApiError,
  registerPatient,
  registerProfessional,
  type ProfessionalRegistration,
} from "@/lib/professional-api";

export const Route = createFileRoute("/inscription")({ component: RegistrationPage });
type RoleChoice = "PATIENT" | "PROFESSIONAL";
const SPECIALTIES = [
  "Médecine générale",
  "Pédiatrie",
  "Gynécologie-obstétrique",
  "Sage-femme",
  "Infirmier / infirmière",
  "Dentisterie",
  "Ophtalmologie",
  "Autre",
];
const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

function LocalPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3">
      <FileCheck2 className="size-5 shrink-0 text-nature-deep" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {(file.size / 1024 / 1024).toFixed(1)} Mo · aperçu local
        </p>
        {url && file.type.startsWith("image/") && (
          <img
            src={url}
            alt={`Aperçu du justificatif ${file.name}`}
            className="mt-2 max-h-32 rounded-lg object-contain"
          />
        )}
        {url && file.type === "application/pdf" && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-xs text-primary underline"
          >
            Ouvrir l’aperçu PDF
          </a>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label={`Retirer ${file.name}`}
      >
        <X />
      </Button>
    </li>
  );
}

function RegistrationPage() {
  const [role, setRole] = useState<RoleChoice | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [diplomas, setDiplomas] = useState<File[]>([]);
  const [identity, setIdentity] = useState<File[]>([]);
  const [fields, setFields] = useState<ProfessionalRegistration>({
    role: "PROFESSIONAL",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    specialty: "",
    professionalId: "",
    facility: "",
    city: "",
    address: "",
    experience: "",
    presentation: "",
  });
  const [patient, setPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  function addFiles(event: ChangeEvent<HTMLInputElement>, kind: "diploma" | "identity") {
    const input = event.currentTarget;
    const selected = Array.from(input.files ?? []);
    input.value = "";
    const invalid = selected.find((file) => !ACCEPTED.includes(file.type) || file.size > MAX_SIZE);
    if (invalid) {
      setError(`${invalid.name} : choisissez un PDF, JPG, PNG ou WEBP de 10 Mo maximum.`);
      return;
    }
    setError("");
    if (kind === "diploma") setDiplomas((current) => [...current, ...selected]);
    else setIdentity((current) => [...current, ...selected]);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      if (role === "PATIENT") {
        await registerPatient({ role: "PATIENT", ...patient });
        setSuccess(
          "Votre demande de création de compte a été transmise. Vous pouvez maintenant vous connecter.",
        );
      } else if (role === "PROFESSIONAL") {
        if (!diplomas.length)
          throw new ApiError("Ajoutez au moins un diplôme ou justificatif de qualification.");
        const result = await registerProfessional(fields, { diploma: diplomas, identity });
        setSuccess(
          `Votre dossier a été transmis. Statut reçu du service : ${result.status}. Vous pourrez suivre son avancement après connexion.`,
        );
        setDiplomas([]);
        setIdentity([]);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "L’inscription n’a pas pu aboutir.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        icon={UserRound}
        eyebrow="Créer un compte"
        title="Bienvenue sur Alafia"
        description="Choisissez votre type de compte. Les justificatifs professionnels sont transmis au service sécurisé lorsqu’il sera connecté."
      />
      <div className="container-page max-w-4xl py-8">
        {!role ? (
          <section className="grid gap-4 md:grid-cols-2" aria-label="Choisir un type de compte">
            <button
              onClick={() => setRole("PATIENT")}
              className="rounded-3xl border border-border/70 bg-card p-7 text-left shadow-soft transition hover:border-nature"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-mint-soft text-primary">
                <UserRound />
              </span>
              <h2 className="mt-5 text-xl font-semibold">Je suis un patient / utilisateur</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Créer un compte pour utiliser les services Alafia.
              </p>
            </button>
            <button
              onClick={() => setRole("PROFESSIONAL")}
              className="rounded-3xl border border-border/70 bg-card p-7 text-left shadow-soft transition hover:border-nature"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-mint-soft text-primary">
                <BriefcaseMedical />
              </span>
              <h2 className="mt-5 text-xl font-semibold">Je suis médecin / professionnel</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Soumettre un profil professionnel à vérifier.
              </p>
            </button>
            <p className="text-sm text-muted-foreground md:col-span-2">
              Vous avez déjà un compte ?{" "}
              <a href="/connexion" className="font-semibold text-primary underline">
                Se connecter
              </a>
            </p>
          </section>
        ) : (
          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-card md:p-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => {
                setRole(null);
                setError("");
                setSuccess("");
              }}
            >
              <ArrowLeft /> Changer de type de compte
            </Button>
            <h2 className="text-xl font-semibold">
              {role === "PATIENT" ? "Inscription patient" : "Inscription professionnelle"}
            </h2>
            {success ? (
              <div className="mt-5 space-y-4">
                <Notice>{success}</Notice>
                <Button asChild>
                  <a href="/connexion">Aller à la connexion</a>
                </Button>
              </div>
            ) : (
              <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="firstName"
                    label="Prénom"
                    required
                    value={role === "PATIENT" ? patient.firstName : fields.firstName}
                    onChange={(value) =>
                      role === "PATIENT"
                        ? setPatient({ ...patient, firstName: value })
                        : setFields({ ...fields, firstName: value })
                    }
                  />
                  <Field
                    id="lastName"
                    label="Nom"
                    required
                    value={role === "PATIENT" ? patient.lastName : fields.lastName}
                    onChange={(value) =>
                      role === "PATIENT"
                        ? setPatient({ ...patient, lastName: value })
                        : setFields({ ...fields, lastName: value })
                    }
                  />
                  <Field
                    id="email"
                    label="Adresse e-mail"
                    type="email"
                    required
                    value={role === "PATIENT" ? patient.email : fields.email}
                    onChange={(value) =>
                      role === "PATIENT"
                        ? setPatient({ ...patient, email: value })
                        : setFields({ ...fields, email: value })
                    }
                  />
                  <Field
                    id="phone"
                    label="Téléphone"
                    type="tel"
                    required
                    value={role === "PATIENT" ? patient.phone : fields.phone}
                    onChange={(value) =>
                      role === "PATIENT"
                        ? setPatient({ ...patient, phone: value })
                        : setFields({ ...fields, phone: value })
                    }
                  />
                  <Field
                    id="password"
                    label="Mot de passe"
                    type="password"
                    required
                    minLength={10}
                    autoComplete="new-password"
                    value={role === "PATIENT" ? patient.password : fields.password}
                    onChange={(value) =>
                      role === "PATIENT"
                        ? setPatient({ ...patient, password: value })
                        : setFields({ ...fields, password: value })
                    }
                  />
                </div>
                {role === "PROFESSIONAL" && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Spécialité</Label>
                        <select
                          id="specialty"
                          required
                          value={fields.specialty}
                          onChange={(e) => setFields({ ...fields, specialty: e.target.value })}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">Choisir une spécialité</option>
                          {SPECIALTIES.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Field
                        id="professionalId"
                        label="N° d’ordre / identifiant professionnel (si applicable)"
                        value={fields.professionalId}
                        onChange={(value) => setFields({ ...fields, professionalId: value })}
                      />
                      <Field
                        id="facility"
                        label="Établissement de santé"
                        required
                        value={fields.facility}
                        onChange={(value) => setFields({ ...fields, facility: value })}
                      />
                      <Field
                        id="city"
                        label="Ville"
                        required
                        value={fields.city}
                        onChange={(value) => setFields({ ...fields, city: value })}
                      />
                      <Field
                        id="address"
                        label="Adresse professionnelle"
                        required
                        value={fields.address}
                        onChange={(value) => setFields({ ...fields, address: value })}
                      />
                      <Field
                        id="experience"
                        label="Années d’expérience (facultatif)"
                        type="number"
                        min="0"
                        value={fields.experience}
                        onChange={(value) => setFields({ ...fields, experience: value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="presentation">Présentation professionnelle</Label>
                      <Textarea
                        id="presentation"
                        rows={4}
                        maxLength={1500}
                        value={fields.presentation}
                        onChange={(e) => setFields({ ...fields, presentation: e.target.value })}
                        placeholder="Votre parcours et les soins proposés"
                      />
                    </div>
                    <UploadGroup
                      id="diplomas"
                      title="Diplômes et justificatifs de qualification"
                      files={diplomas}
                      onChange={(e) => addFiles(e, "diploma")}
                      onRemove={(i) => setDiplomas((all) => all.filter((_, index) => index !== i))}
                      required
                    />
                    <UploadGroup
                      id="identity"
                      title="Pièce d’identité (si nécessaire)"
                      files={identity}
                      onChange={(e) => addFiles(e, "identity")}
                      onRemove={(i) => setIdentity((all) => all.filter((_, index) => index !== i))}
                    />
                    <Notice>
                      Ces fichiers restent dans la mémoire de cette page jusqu’à l’envoi. Ils ne
                      sont pas conservés ici. Leur stockage définitif nécessite le service backend
                      sécurisé; l’inscription échouera avec un message explicite tant que ce service
                      n’est pas connecté.
                    </Notice>
                  </>
                )}
                {error && (
                  <p
                    role="alert"
                    className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    {error}
                  </p>
                )}
                <Button type="submit" size="lg" disabled={busy}>
                  {busy
                    ? "Envoi en cours…"
                    : role === "PATIENT"
                      ? "Créer mon compte"
                      : "Soumettre mon dossier de vérification"}
                </Button>
              </form>
            )}
          </section>
        )}
      </div>
    </>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  minLength,
  min,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
  min?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        min={min}
        autoComplete={autoComplete}
      />
    </div>
  );
}

function UploadGroup({
  id,
  title,
  files,
  onChange,
  onRemove,
  required = false,
}: {
  id: string;
  title: string;
  files: File[];
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  required?: boolean;
}) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-border/70 p-4">
      <legend className="px-1 font-semibold">
        {title}
        {required ? " *" : ""}
      </legend>
      <Label htmlFor={id} className="sr-only">
        {title}
      </Label>
      <Input
        id={id}
        type="file"
        accept=".pdf,image/jpeg,image/png,image/webp"
        multiple
        onChange={onChange}
      />
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <LocalPreview
              key={`${file.name}-${file.lastModified}-${index}`}
              file={file}
              onRemove={() => onRemove(index)}
            />
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        PDF, JPG, PNG ou WEBP · 10 Mo maximum par fichier. Aperçu local uniquement.
      </p>
    </fieldset>
  );
}
