import { useState } from "react";
import { HeartPulse, Save } from "lucide-react";
import { toast } from "sonner";

import { Notice } from "@/components/alafia/Notice";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPTY_HEALTH_INFO,
  HEALTH_INFO_KEY,
  PAIN_FREQUENCIES,
  type HealthInfo,
  type YesNo,
} from "@/lib/health-storage";
import { useStoredState } from "@/lib/local-store";

function AnswerSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: YesNo;
  onChange: (value: YesNo) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value as YesNo)}
      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
    >
      <option value="">Choisissez une réponse</option>
      <option value="oui">Oui</option>
      <option value="non">Non</option>
    </select>
  );
}

export function HealthInfoPanel() {
  const [info, setInfo] = useStoredState<HealthInfo>(HEALTH_INFO_KEY, EMPTY_HEALTH_INFO);
  const [ready, setReady] = useState(false);

  return (
    <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft md:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
          <HeartPulse className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-semibold">Informations de santé</h2>
          <p className="text-sm text-muted-foreground">Répondez seulement si vous le souhaitez.</p>
        </div>
      </div>
      <form
        className="mt-5 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setInfo({ ...info, updatedAt: Date.now() });
          setReady(true);
          toast.success("Informations enregistrées sur cet appareil");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="chronic">Avez-vous une maladie chronique ?</Label>
            <AnswerSelect
              id="chronic"
              value={info.chronic}
              onChange={(chronic) => setInfo({ ...info, chronic, updatedAt: Date.now() })}
            />
          </div>
          {info.chronic === "oui" && (
            <div className="space-y-2">
              <Label htmlFor="chronic-detail">Laquelle, si vous souhaitez le préciser ?</Label>
              <Textarea
                id="chronic-detail"
                rows={2}
                value={info.chronicDetail}
                onChange={(event) =>
                  setInfo({ ...info, chronicDetail: event.target.value, updatedAt: Date.now() })
                }
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="pain">Ressentez-vous régulièrement une douleur ou un malaise ?</Label>
            <AnswerSelect
              id="pain"
              value={info.pain}
              onChange={(pain) => setInfo({ ...info, pain, updatedAt: Date.now() })}
            />
          </div>
        </div>
        {info.pain === "oui" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pain-location">Où se situe la douleur ou le malaise ?</Label>
              <Textarea
                id="pain-location"
                rows={2}
                value={info.painLocation}
                onChange={(event) =>
                  setInfo({ ...info, painLocation: event.target.value, updatedAt: Date.now() })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pain-since">Depuis quand ?</Label>
              <Textarea
                id="pain-since"
                rows={2}
                value={info.painSince}
                onChange={(event) =>
                  setInfo({ ...info, painSince: event.target.value, updatedAt: Date.now() })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pain-frequency">À quelle fréquence ?</Label>
              <select
                id="pain-frequency"
                value={info.painFrequency}
                onChange={(event) =>
                  setInfo({ ...info, painFrequency: event.target.value, updatedAt: Date.now() })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Choisissez si vous le souhaitez</option>
                {PAIN_FREQUENCIES.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {frequency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="health-extra">Autres informations que vous souhaitez noter</Label>
          <Textarea
            id="health-extra"
            rows={3}
            value={info.extra}
            onChange={(event) =>
              setInfo({ ...info, extra: event.target.value, updatedAt: Date.now() })
            }
            placeholder="Aucune information n'est obligatoire."
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">
            <Save />
            Enregistrer
          </Button>
          {(ready || info.updatedAt) && (
            <span className="text-xs text-muted-foreground">Enregistré localement</span>
          )}
        </div>
      </form>
      <Notice className="mt-5">
        Ces réponses servent uniquement à organiser votre suivi personnel. Elles ne sont pas
        interprétées pour poser un diagnostic.
      </Notice>
    </section>
  );
}
