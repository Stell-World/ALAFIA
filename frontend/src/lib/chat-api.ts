export type ChatRole = "user" | "assistant";
export type ChatMessage = { id: string; role: ChatRole; content: string };

/**
 * Future Express backend: set VITE_ALAFIA_API_URL (e.g. https://api.example.com).
 * The client POSTs { messages } to `${VITE_ALAFIA_API_URL}/api/chat` and expects { reply }.
 * Without it, a clearly labelled demo reply is returned.
 */
const API_URL = import.meta.env["VITE_ALAFIA_API_URL"] as string | undefined;

export const isAssistantConnected = Boolean(API_URL);

export async function sendChatMessage(
  messages: ChatMessage[],
  preferredLanguage?: string,
): Promise<string> {
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 900));
    return "Mode démonstration : l'assistant Alafia n'est pas encore connecté. Une fois activé, il pourra vous donner des informations générales sur votre question. Pour tout symptôme qui vous inquiète, consultez un professionnel de santé ou rendez-vous au centre de santé le plus proche.";
  }

  const res = await fetch(`${API_URL.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map(({ role, content }) => ({ role, content })),
      ...(preferredLanguage ? { preferredLanguage } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const data = (await res.json()) as { reply?: string };
  if (!data.reply) throw new Error("Réponse vide");
  return data.reply;
}
