/** Frontend contract for the protected account and professional-verification API. */
const API_BASE =
  (import.meta.env["VITE_ALAFIA_API_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";

export type VerificationStatus =
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "ADDITIONAL_INFORMATION_REQUIRED"
  | "SUSPENDED";

export type ProfessionalSummary = {
  id: string;
  name: string;
  photoUrl?: string | null;
  specialty: string;
  facility?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  availability?: string | null;
  verified: true;
};
export type ProfessionalProfile = ProfessionalSummary & {
  presentation?: string | null;
  experience?: number | null;
};

export type VerificationDocument = {
  id: string;
  name: string;
  category: string;
  downloadUrl?: string;
};
export type VerificationRequest = {
  id: string;
  status: VerificationStatus;
  submittedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  professionalId?: string;
  facility: string;
  city: string;
  address: string;
  experience?: number | null;
  presentation: string;
  requestedInformation?: string | null;
  documents: VerificationDocument[];
  history: { status: VerificationStatus; at: string; actor: string; note?: string }[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, credentials: "include" });
  } catch {
    throw new ApiError(
      "Le service de comptes Alafia n’est pas joignable. Réessayez lorsque le backend sera connecté.",
    );
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiError(
      "Le service de comptes Alafia n’est pas configuré ou a renvoyé une réponse invalide.",
      response.status,
    );
  }
  let payload: { message?: string; error?: string };
  try {
    payload = (await response.json()) as { message?: string; error?: string };
  } catch {
    throw new ApiError("Le service Alafia a renvoyé une réponse illisible.", response.status);
  }
  if (!response.ok)
    throw new ApiError(
      payload.message || payload.error || `La demande a échoué (${response.status}).`,
      response.status,
    );
  return payload as T;
}

export type PatientRegistration = {
  role: "PATIENT";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};
export type ProfessionalRegistration = {
  role: "PROFESSIONAL";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  specialty: string;
  professionalId: string;
  facility: string;
  city: string;
  address: string;
  experience: string;
  presentation: string;
};

export async function registerPatient(data: PatientRegistration) {
  const result = await request<{ userId?: string; role?: string }>("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!result.userId || result.role !== "PATIENT")
    throw new ApiError("La réponse du service d’inscription patient est invalide.");
  return result as { userId: string; role: "PATIENT" };
}

export async function registerProfessional(
  data: ProfessionalRegistration,
  files: { diploma: File[]; identity: File[] },
) {
  const body = new FormData();
  Object.entries(data).forEach(([key, value]) => body.append(key, value));
  files.diploma.forEach((file) => body.append("diplomas", file));
  files.identity.forEach((file) => body.append("identityDocuments", file));
  const result = await request<{ requestId?: string; status?: string }>(
    "/api/professionals/registration-requests",
    { method: "POST", body },
  );
  if (!result.requestId || result.status !== "PENDING_VERIFICATION")
    throw new ApiError("Le service n’a pas confirmé la réception du dossier de vérification.");
  return result as { requestId: string; status: "PENDING_VERIFICATION" };
}

export async function signIn(email: string, password: string) {
  const result = await request<{ user?: { id?: string; role?: string } }>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!result.user?.id || !["PATIENT", "PROFESSIONAL", "ADMIN"].includes(result.user.role ?? ""))
    throw new ApiError("La réponse du service de connexion est invalide.");
  return result as { user: { id: string; role: "PATIENT" | "PROFESSIONAL" | "ADMIN" } };
}

export const getProfessionalDashboard = () =>
  request<{ request: VerificationRequest }>("/api/professionals/me");
export const updateProfessionalProfile = (data: Record<string, string>) =>
  request<{ request: VerificationRequest }>("/api/professionals/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
export const listVerificationRequests = (status = "PENDING_VERIFICATION") =>
  request<{ requests: VerificationRequest[] }>(
    `/api/admin/professional-verifications?status=${encodeURIComponent(status)}`,
  );
export const decideVerification = (
  id: string,
  action: "verify" | "reject" | "request-information" | "suspend",
  note: string,
) =>
  request<{ request: VerificationRequest }>(
    `/api/admin/professional-verifications/${encodeURIComponent(id)}/${action}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    },
  );
export const findVerifiedProfessionals = (specialty: string, city: string) =>
  request<{ professionals: ProfessionalSummary[] }>(
    `/api/professionals/search?${new URLSearchParams({ specialty, city, verified: "true" })}`,
  );
export const getVerifiedProfessional = (id: string) =>
  request<{ professional: ProfessionalProfile }>(`/api/professionals/${encodeURIComponent(id)}`);
