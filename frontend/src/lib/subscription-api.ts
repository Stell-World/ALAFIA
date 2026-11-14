const API_BASE =
  (import.meta.env["VITE_ALAFIA_API_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";

export type SubscriptionStatus = "FREE" | "ACTIVE" | "PENDING" | "EXPIRED" | "CANCELLED";
export type Subscription = {
  status: SubscriptionStatus;
  planId?: string | null;
  planName?: string | null;
  amount?: number | null;
  currency?: string | null;
  startedAt?: string | null;
  expiresAt?: string | null;
};
export type PaymentMethod = "mobile_money" | "bank_card";

export class SubscriptionApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "SubscriptionApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, credentials: "include" });
  } catch {
    throw new SubscriptionApiError("Le service d’abonnement Alafia n’est pas joignable.");
  }
  if (!(response.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    throw new SubscriptionApiError("Le service d’abonnement n’est pas configuré ou a renvoyé une réponse invalide.", response.status);
  }
  const data = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
  if (!response.ok) {
    throw new SubscriptionApiError(data.message || data.error || `La demande a échoué (${response.status}).`, response.status);
  }
  return data as T;
}

export async function getMySubscription() {
  const result = await request<{ subscription?: Subscription }>("/api/subscriptions/me");
  if (!result.subscription || !["FREE", "ACTIVE", "PENDING", "EXPIRED", "CANCELLED"].includes(result.subscription.status)) {
    throw new SubscriptionApiError("Le statut d’abonnement renvoyé par le service est invalide.");
  }
  return result.subscription;
}

export async function startSubscriptionCheckout(input: {
  planId: "standard";
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
}) {
  return request<{ checkoutUrl?: string; status?: "PENDING"; message?: string }>(
    "/api/subscriptions/checkout",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}
