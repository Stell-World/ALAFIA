import { useCallback, useEffect, useState } from "react";
import { getMySubscription, type Subscription } from "./subscription-api";

export function useSubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSubscription(await getMySubscription());
    } catch (cause) {
      setSubscription(null);
      setError(cause instanceof Error ? cause.message : "Impossible de vérifier l’abonnement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  return { subscription, loading, error, refresh, active: subscription?.status === "ACTIVE" };
}
