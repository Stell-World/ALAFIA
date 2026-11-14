import { createFileRoute } from "@tanstack/react-router";
import {
  Leaf,
  MessageCircleHeart,
  Plus,
  SendHorizontal,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Notice } from "@/components/alafia/Notice";
import { VerifiedProfessionalFinder } from "@/components/alafia/VerifiedProfessionalFinder";
import { SubscriptionGate } from "@/components/alafia/SubscriptionGate";
import { PageHeader } from "@/components/alafia/PageHeader";
import { SpeakButton, VoiceControls } from "@/components/alafia/VoiceControls";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isAssistantConnected, sendChatMessage, type ChatMessage } from "@/lib/chat-api";
import {
  ACTIVE_CHAT_KEY,
  CHAT_HISTORY_KEY,
  conversationTitle,
  createConversation,
  MAX_SAVED_CONVERSATIONS,
  MAX_SAVED_MESSAGES,
  type SavedConversation,
} from "@/lib/chat-history";
import { readJSON, useStoredState } from "@/lib/local-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Assistant IA de santé — Alafia" },
      {
        name: "description",
        content: "Posez vos questions de santé et recevez des informations générales claires.",
      },
      { property: "og:title", content: "Assistant IA de santé — Alafia" },
      {
        property: "og:description",
        content: "Un assistant d'information santé, disponible à tout moment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

const SUGGESTIONS = [
  "Comment bien s'hydrater quand il fait chaud ?",
  "Quels sont les gestes pour prévenir le paludisme ?",
  "Pourquoi le carnet de vaccination est-il important ?",
];

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Bonjour, je suis l'assistant Alafia. Je peux vous donner des informations générales de santé. Je ne suis pas médecin et je ne pose pas de diagnostic. Quelle est votre question ?",
};
const EMPTY_MESSAGES: ChatMessage[] = [WELCOME];

function AssistantPage() {
  const [conversations, setConversations, historyReady] = useStoredState<SavedConversation[]>(
    CHAT_HISTORY_KEY,
    [],
  );
  const [activeConversationId, setActiveConversationId, activeIdReady] = useStoredState<string>(
    ACTIVE_CHAT_KEY,
    "",
  );
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  );
  const messages = activeConversation?.messages ?? EMPTY_MESSAGES;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orientationOpen, setOrientationOpen] = useState(false);
  const [language, setLanguage] = useState("fr-FR");
  const [historyError, setHistoryError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!historyReady || !activeIdReady) return;
    if (conversations.length === 0) {
      const first = createConversation(WELCOME);
      try {
        setConversations([first]);
        setActiveConversationId(first.id);
      } catch {
        setHistoryError("L’historique est indisponible dans le stockage local de cet appareil.");
      }
      return;
    }
    if (!conversations.some((conversation) => conversation.id === activeConversationId)) {
      const mostRecent = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      if (mostRecent) setActiveConversationId(mostRecent.id);
    }
  }, [
    historyReady,
    activeIdReady,
    conversations,
    activeConversationId,
    setConversations,
    setActiveConversationId,
  ]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function saveConversationMessages(conversationId: string, nextMessages: ChatMessage[]) {
    const current = readJSON<SavedConversation[]>(CHAT_HISTORY_KEY, conversations);
    const next = current
      .map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: nextMessages.slice(-MAX_SAVED_MESSAGES),
              title: conversationTitle(nextMessages),
              updatedAt: Date.now(),
            }
          : conversation,
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_SAVED_CONVERSATIONS);
    try {
      setConversations(next);
      setHistoryError("");
    } catch {
      setHistoryError(
        "L’historique n’a pas pu être enregistré sur cet appareil. Vérifiez l’espace disponible.",
      );
    }
  }

  function startNewConversation() {
    if (loading || !historyReady) return;
    const next = createConversation(WELCOME);
    try {
      setConversations([next, ...conversations].slice(0, MAX_SAVED_CONVERSATIONS));
      setHistoryError("");
    } catch {
      setHistoryError("La nouvelle discussion n’a pas pu être enregistrée sur cet appareil.");
    }
    setActiveConversationId(next.id);
    setError(null);
    setOrientationOpen(false);
    setInput("");
  }

  function deleteConversation(conversation: SavedConversation) {
    if (!window.confirm(`Supprimer la discussion « ${conversation.title} » de cet appareil ?`))
      return;
    const remaining = conversations.filter((item) => item.id !== conversation.id);
    if (remaining.length === 0) {
      const next = createConversation(WELCOME);
      try {
        setConversations([next]);
      } catch {
        setHistoryError("La discussion n’a pas pu être enregistrée.");
      }
      setActiveConversationId(next.id);
    } else {
      try {
        setConversations(remaining);
      } catch {
        setHistoryError("La discussion n’a pas pu être supprimée de cet appareil.");
      }
      if (conversation.id === activeConversationId) setActiveConversationId(remaining[0]!.id);
    }
    setError(null);
    setOrientationOpen(false);
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading || !activeConversation) return;
    const conversationId = activeConversation.id;
    const next: ChatMessage[] = [...messages, { id: crypto.randomUUID(), role: "user", content }];
    saveConversationMessages(conversationId, next);
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const reply = await sendChatMessage(
        next.filter((m) => m.id !== "welcome"),
        language,
      );
      const latestMessages =
        readJSON<SavedConversation[]>(CHAT_HISTORY_KEY, []).find(
          (item) => item.id === conversationId,
        )?.messages ?? next;
      saveConversationMessages(conversationId, [
        ...latestMessages,
        { id: crypto.randomUUID(), role: "assistant", content: reply },
      ]);
    } catch {
      setError("L'assistant n'a pas pu répondre. Vérifiez votre connexion puis réessayez.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const urgentContext =
    /difficult[eé] [àa] respirer|perte de connaissance|saignement abondant|convulsion|douleur intense|urgence|ne respire pas/i.test(
      latestUserMessage,
    );
  const consultationContext =
    /douleur|sympt[oô]me|enceinte|grossesse|fi[eè]vre|saignement|m[eé]decin|sage-femme|consultation|centre de sant[eé]/i.test(
      latestUserMessage,
    );

  return (
    <>
      <PageHeader
        icon={MessageCircleHeart}
        eyebrow="Assistant IA"
        title="Posez vos questions de santé"
        description="Des réponses générales et faciles à comprendre. L'assistant ne remplace pas une consultation."
      />
      <div className="container-page grid grid-cols-1 gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          aria-label="Conversation"
          className="flex h-[min(70vh,42rem)] flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-card"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-mint-soft/60 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-nature-gradient text-primary-foreground">
                <Leaf className="size-4" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-primary">Assistant Alafia</p>
                <p className="text-xs text-muted-foreground">
                  {isAssistantConnected ? "En ligne" : "Mode démonstration"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={loading || !historyReady}
              onClick={startNewConversation}
            >
              <Plus />
              Nouvelle conversation
            </Button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6" aria-live="polite">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <p
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-[15px] leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-lg bg-primary text-primary-foreground"
                      : "rounded-bl-lg bg-mint-soft text-foreground",
                  )}
                >
                  {m.content}
                </p>
                {m.role === "assistant" && <SpeakButton text={m.content} language={language} />}
              </div>
            ))}

            {!loading && urgentContext && (
              <div
                role="alert"
                className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
              >
                <p className="font-semibold text-destructive">
                  Une prise en charge urgente est prioritaire.
                </p>
                <p className="mt-1">
                  Contactez immédiatement les services d’urgence locaux ou rendez-vous au centre de
                  santé le plus proche. La recherche d’un professionnel sur Alafia ne doit pas
                  retarder les soins.
                </p>
                <a
                  href="/#centres"
                  className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground"
                >
                  Ouvrir la carte des centres
                </a>
              </div>
            )}
            {!loading && consultationContext && !urgentContext && (
              <div className="rounded-2xl border border-mint bg-card p-4 text-sm">
                <p className="font-semibold">
                  Souhaitez-vous rechercher un professionnel de santé ?
                </p>
                <p className="mt-1 text-muted-foreground">
                  La recherche affiche uniquement les profils vérifiés renvoyés par le service
                  Alafia.
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  onClick={() => setOrientationOpen((open) => !open)}
                >
                  {orientationOpen ? "Fermer la recherche" : "Rechercher un professionnel"}
                </Button>
                {orientationOpen && (
                  <SubscriptionGate feature="Coordonnées des professionnels vérifiés">
                    <VerifiedProfessionalFinder />
                  </SubscriptionGate>
                )}
              </div>
            )}

            {loading && (
              <div className="flex justify-start" role="status" aria-label="L'assistant écrit">
                <span className="inline-flex items-center gap-1.5 rounded-3xl rounded-bl-lg bg-mint-soft px-4 py-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="typing-dot size-2 rounded-full bg-nature"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-2xl border border-destructive/25 bg-card p-3 text-sm text-destructive"
              >
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                {error}
              </div>
            )}

            {historyReady && activeConversation && messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-full border border-mint bg-card px-4 py-2 text-left text-sm text-primary transition-colors hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={onSubmit} className="border-t border-border/70 p-3 md:p-4">
            <VoiceControls
              language={language}
              onLanguageChange={setLanguage}
              onTranscript={(transcript) =>
                setInput((current) => `${current}${current ? " " : ""}${transcript}`)
              }
            />
            <label htmlFor="chat-input" className="sr-only">
              Votre message
            </label>
            <div className="flex items-end gap-2 rounded-3xl border border-input bg-mint-soft/50 p-2 focus-within:border-nature focus-within:ring-2 focus-within:ring-ring/30">
              <Textarea
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                placeholder="Écrivez ou dictez votre question…"
                className="max-h-32 min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || loading || !activeConversation || !historyReady}
                aria-label="Envoyer"
              >
                <SendHorizontal />
              </Button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">Historique des discussions</h2>
              <Button
                size="sm"
                variant="outline"
                disabled={loading || !historyReady}
                onClick={startNewConversation}
                aria-label="Démarrer une nouvelle discussion"
              >
                <Plus /> Nouveau
              </Button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Enregistré uniquement dans ce navigateur. Ce n’est pas un stockage sécurisé; supprimez
              vos discussions si l’appareil est partagé.
            </p>
            {!historyReady && (
              <p role="status" className="mt-4 text-sm text-muted-foreground">
                Chargement de l’historique…
              </p>
            )}
            {historyError && (
              <p role="alert" className="mt-3 text-xs text-destructive">
                {historyError}
              </p>
            )}
            {historyReady && conversations.length === 0 && (
              <p className="mt-4 rounded-xl bg-mint-soft p-3 text-sm text-muted-foreground">
                Aucune discussion enregistrée.
              </p>
            )}
            <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
              {[...conversations]
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((conversation) => (
                  <li key={conversation.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={loading}
                      aria-current={conversation.id === activeConversationId ? "page" : undefined}
                      onClick={() => {
                        setActiveConversationId(conversation.id);
                        setError(null);
                        setOrientationOpen(false);
                      }}
                      className={cn(
                        "min-w-0 flex-1 rounded-xl px-3 py-2 text-left transition-colors",
                        conversation.id === activeConversationId
                          ? "bg-mint-soft text-primary"
                          : "hover:bg-muted/60",
                      )}
                    >
                      <span className="block truncate text-sm font-medium">
                        {conversation.title}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {new Date(conversation.updatedAt).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={loading}
                      aria-label={`Supprimer la discussion ${conversation.title}`}
                      onClick={() => deleteConversation(conversation)}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
            </ul>
          </section>
          <Notice tone="warning">
            <strong className="font-semibold">L'assistant n'est pas un médecin.</strong> Il ne pose
            pas de diagnostic et ne prescrit pas de traitement.
          </Notice>
          <div className="rounded-3xl bg-nature-gradient p-6 text-primary-foreground shadow-card">
            <h2 className="text-lg font-semibold text-primary-foreground">En cas d'urgence</h2>
            <p className="mt-2 text-base leading-relaxed text-on-dark-muted">
              Difficulté à respirer, forte fièvre chez un bébé, saignement important : rendez-vous
              immédiatement au centre de santé le plus proche.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
