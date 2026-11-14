export type NotificationState = "unsupported" | NotificationPermission;

export function notificationState(): NotificationState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotifications(): Promise<NotificationState> {
  if (notificationState() === "unsupported") return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return notificationState();
  }
}

/** Shows a system notification when allowed; returns false otherwise (caller shows an in-app toast). */
export function showSystemNotification(title: string, body: string) {
  if (notificationState() !== "granted") return false;
  try {
    new Notification(title, { body, icon: "/favicon.ico", tag: `${title}-${body}` });
    return true;
  } catch {
    return false;
  }
}

export const NOTIFICATION_LABELS: Record<NotificationState, string> = {
  unsupported: "Votre navigateur ne prend pas en charge les notifications.",
  default: "Les notifications ne sont pas encore autorisées.",
  granted: "Notifications autorisées sur cet appareil.",
  denied: "Notifications bloquées : autorisez-les dans les réglages de votre navigateur.",
};

