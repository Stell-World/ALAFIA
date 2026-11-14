import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const VOICE_LANGUAGES = [
  { code: "fr-FR", label: "Français" },
  { code: "ee-TG", label: "Éwé" },
  { code: "kbp-TG", label: "Kabiye" },
  { code: "kdh-TG", label: "Tem" },
  { code: "mfq-TG", label: "Moba" },
  { code: "gej-TG", label: "Mina / Gen" },
] as const;

type SpeechRecognitionResultLike = { isFinal: boolean; 0?: { transcript?: string } };
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};
type SpeechRecognitionErrorLike = { error: string };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

function recognitionError(code: string) {
  if (code === "not-allowed" || code === "service-not-allowed")
    return "L’accès au micro ou au service vocal a été refusé. Vérifiez les autorisations du navigateur.";
  if (code === "language-not-supported")
    return "La reconnaissance vocale ne prend pas en charge cette langue sur ce navigateur.";
  if (code === "no-speech")
    return "Aucune parole n’a été détectée. Vous pouvez réessayer ou écrire votre question.";
  if (code === "network")
    return "Le service de reconnaissance vocale n’est pas accessible. Vous pouvez écrire votre question.";
  return "La reconnaissance vocale a rencontré un problème. Vous pouvez écrire votre question.";
}

export function VoiceControls({
  language,
  onLanguageChange,
  onTranscript,
}: {
  language: string;
  onLanguageChange: (language: string) => void;
  onTranscript: (text: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  function toggleMicrophone() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setInterim("");
      return;
    }
    const SpeechRecognitionApi =
      (window as SpeechWindow).SpeechRecognition ??
      (window as SpeechWindow).webkitSpeechRecognition;
    if (!SpeechRecognitionApi) {
      setError(
        "La saisie vocale n’est pas disponible dans ce navigateur. Vous pouvez écrire votre question.",
      );
      return;
    }
    setError("");
    setInterim("");
    const recognition = new SpeechRecognitionApi();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const finalParts: string[] = [];
      const interimParts: string[] = [];
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (!result) continue;
        const transcript = result?.[0]?.transcript?.trim();
        if (!transcript) continue;
        (result.isFinal ? finalParts : interimParts).push(transcript);
      }
      if (finalParts.length) onTranscript(finalParts.join(" "));
      setInterim(interimParts.join(" "));
    };
    recognition.onerror = (event) => {
      setError(recognitionError(event.error));
      setListening(false);
      setInterim("");
    };
    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("Le micro n’a pas pu démarrer. Vérifiez son autorisation puis réessayez.");
      setListening(false);
    }
  }

  return (
    <div className="mb-2 rounded-2xl border border-border/70 bg-card p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-40 flex-1 space-y-1">
          <Label htmlFor="assistant-language">Langue parlée</Label>
          <select
            id="assistant-language"
            value={language}
            onChange={(event) => {
              recognitionRef.current?.stop();
              setListening(false);
              onLanguageChange(event.target.value);
              setError("");
            }}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {VOICE_LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant={listening ? "destructive" : "outline"}
          onClick={toggleMicrophone}
          aria-pressed={listening}
        >
          {listening ? <MicOff /> : <Mic />}
          {listening ? "Arrêter l’écoute" : "Parler"}
        </Button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        La transcription dépend du navigateur et peut être traitée par son service vocal. Alafia
        n’enregistre pas l’audio ici. Relisez le texte transcrit avant de l’envoyer. La réponse dans
        la langue choisie dépend aussi des capacités du service IA connecté.
      </p>
      {listening && (
        <p role="status" className="mt-2 text-sm text-primary">
          Je vous écoute… {interim && <span className="text-muted-foreground">{interim}</span>}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function SpeakButton({ text, language }: { text: string; language: string }) {
  const [error, setError] = useState("");
  function speak() {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setError("La lecture vocale n’est pas disponible sur cet appareil.");
      return;
    }
    const baseLanguage = language.split("-")[0]?.toLowerCase();
    const voice = window.speechSynthesis
      .getVoices()
      .find(
        (item) =>
          item.lang.toLowerCase().startsWith(`${baseLanguage}-`) ||
          item.lang.toLowerCase() === baseLanguage,
      );
    if (!voice) {
      setError("Aucune voix n’est installée pour cette langue sur cet appareil.");
      return;
    }
    setError("");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  }
  return (
    <span className="mt-1 inline-flex flex-col items-start">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={speak}
        aria-label="Lire cette réponse à voix haute"
      >
        <Volume2 /> Écouter
      </Button>
      {error && (
        <span role="status" className="text-xs text-muted-foreground">
          {error}
        </span>
      )}
    </span>
  );
}
