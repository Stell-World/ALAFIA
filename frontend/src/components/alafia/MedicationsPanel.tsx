import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteFile, getFile, putFile, validateFile, type StoredFile } from "@/lib/file-store";
import { FREQUENCIES, MEDICATIONS_KEY, type Medication } from "@/lib/health-storage";
import { newId, useStoredState } from "@/lib/local-store";

const emptyForm = (): Medication => ({
  id: "",
  name: "",
  photoId: null,
  photoIds: [],
  indications: "",
  times: [{ time: "08:00", enabled: true }],
  frequency: "",
  duration: "",
  startDate: "",
  endDate: "",
  createdAt: Date.now(),
});

function photoIdsFor(med: Medication) {
  return med.photoIds?.length ? med.photoIds : med.photoId ? [med.photoId] : [];
}

function MedicationImage({ id }: { id: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let objectUrl = "";
    let live = true;
    void getFile(id).then((file) => {
      if (file && live) {
        objectUrl = URL.createObjectURL(file.blob);
        setUrl(objectUrl);
      }
    });
    return () => {
      live = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);
  return url ? (
    <img src={url} alt="Photo du médicament" className="size-14 rounded-xl object-cover" />
  ) : (
    <span className="grid size-14 place-items-center rounded-xl bg-mint-soft text-primary">
      <Camera className="size-5" aria-hidden />
    </span>
  );
}

function NewPhotoPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-2">
      {url && (
        <img src={url} alt={`Aperçu ${file.name}`} className="size-12 rounded-lg object-cover" />
      )}
      <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
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

export function MedicationsPanel() {
  const [meds, setMeds] = useStoredState<Medication[]>(MEDICATIONS_KEY, []);
  const [form, setForm] = useState<Medication | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function onPhotosChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const selected = Array.from(input.files ?? []);
    input.value = "";
    const invalid = selected.find((file) => !file.type.startsWith("image/") || validateFile(file));
    if (invalid) {
      setError(`${invalid.name} : choisissez une photo JPG, PNG, WEBP ou HEIC de 10 Mo maximum.`);
      return;
    }
    setError("");
    setPhotos((current) => [...current, ...selected]);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form?.name.trim()) {
      setError("Indiquez le nom tel qu’il apparaît sur votre ordonnance.");
      return;
    }
    if (!FREQUENCIES.includes(form.frequency)) {
      setError("Choisissez la fréquence indiquée par votre professionnel de santé.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const existingIds = photoIdsFor(form);
      const added = photos.map(
        (file) =>
          ({
            id: newId(),
            name: file.name,
            type: file.type,
            size: file.size,
            scope: "medicament" as const,
            category: "photo" as const,
            addedAt: Date.now(),
            blob: file,
          }) satisfies StoredFile,
      );
      await Promise.all(added.map((stored) => putFile(stored)));
      const nextPhotoIds = [...existingIds, ...added.map((stored) => stored.id)];
      const saved: Medication = {
        ...form,
        name: form.name.trim(),
        photoIds: nextPhotoIds,
        photoId: nextPhotoIds[0] ?? null,
      };
      const previous = form.id ? meds.find((item) => item.id === form.id) : undefined;
      setMeds(
        form.id
          ? meds.map((item) => (item.id === form.id ? saved : item))
          : [...meds, { ...saved, id: newId() }],
      );
      const removedPhotoIds = previous
        ? photoIdsFor(previous).filter((id) => !nextPhotoIds.includes(id))
        : [];
      await Promise.all(removedPhotoIds.map((id) => deleteFile(id).catch(() => undefined)));
      setForm(null);
      setPhotos([]);
      toast.success("Médicament enregistré sur cet appareil");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(med: Medication) {
    setMeds(meds.filter((item) => item.id !== med.id));
    await Promise.all(photoIdsFor(med).map((id) => deleteFile(id).catch(() => undefined)));
  }

  function edit(med: Medication) {
    setForm({
      ...med,
      photoIds: photoIdsFor(med),
      frequency: FREQUENCIES.includes(med.frequency) ? med.frequency : "",
    });
    setPhotos([]);
    setError("");
  }

  return (
    <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Mes médicaments</h2>
          <p className="text-sm text-muted-foreground">
            Saisissez uniquement les indications reçues d’un professionnel.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm());
            setPhotos([]);
            setError("");
          }}
        >
          <Plus /> Ajouter
        </Button>
      </div>
      {form && (
        <form
          onSubmit={(event) => void submit(event)}
          className="mt-5 grid gap-4 rounded-2xl bg-mint-soft p-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="med-name">Nom du médicament</Label>
            <Input
              id="med-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="med-frequency">Fréquence indiquée</Label>
            <select
              id="med-frequency"
              required
              value={form.frequency}
              onChange={(event) => setForm({ ...form, frequency: event.target.value })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Choisir une fréquence</option>
              {FREQUENCIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="med-indications">Indications reçues (facultatif)</Label>
            <Textarea
              id="med-indications"
              rows={2}
              value={form.indications}
              onChange={(event) => setForm({ ...form, indications: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="med-time">Heure de rappel (facultatif)</Label>
            <Input
              id="med-time"
              type="time"
              value={form.times[0]?.time ?? ""}
              onChange={(event) =>
                setForm({
                  ...form,
                  times: [{ time: event.target.value, enabled: Boolean(event.target.value) }],
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="med-duration">Durée / période (facultatif)</Label>
            <Input
              id="med-duration"
              value={form.duration}
              onChange={(event) => setForm({ ...form, duration: event.target.value })}
              placeholder="Saisissez la durée indiquée"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="med-start">Début (facultatif)</Label>
            <Input
              id="med-start"
              type="date"
              value={form.startDate}
              onChange={(event) => setForm({ ...form, startDate: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="med-end">Fin (facultatif)</Label>
            <Input
              id="med-end"
              type="date"
              value={form.endDate}
              onChange={(event) => setForm({ ...form, endDate: event.target.value })}
            />
          </div>
          <div className="space-y-3 sm:col-span-2">
            <div className="space-y-2">
              <Label htmlFor="med-photos">Photos du médicament (facultatif)</Label>
              <Input
                id="med-photos"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                multiple
                onChange={onPhotosChange}
              />
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Camera className="size-3" /> Vous pouvez sélectionner plusieurs photos. Elles
                restent sur cet appareil.
              </span>
            </div>
            {form.photoIds && form.photoIds.length > 0 && (
              <ul className="flex flex-wrap gap-3">
                {form.photoIds.map((id) => (
                  <li key={id} className="flex items-center gap-1 rounded-xl bg-card p-1">
                    <MedicationImage id={id} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Retirer cette photo"
                      onClick={() => {
                        const next = form.photoIds?.filter((photoId) => photoId !== id) ?? [];
                        setForm({ ...form, photoIds: next, photoId: next[0] ?? null });
                      }}
                    >
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {photos.length > 0 && (
              <ul className="space-y-2">
                {photos.map((file, index) => (
                  <NewPhotoPreview
                    key={`${file.name}-${file.lastModified}-${index}`}
                    file={file}
                    onRemove={() => setPhotos((all) => all.filter((_, i) => i !== index))}
                  />
                ))}
              </ul>
            )}
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {error}
            </p>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(null);
                setPhotos([]);
              }}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}
      <ul className="mt-5 space-y-3">
        {meds.map((med) => (
          <li
            key={med.id}
            className="flex items-center gap-3 rounded-2xl border border-border/70 p-4"
          >
            <div className="flex flex-wrap gap-1">
              {photoIdsFor(med).map((id) => (
                <MedicationImage key={id} id={id} />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{med.name}</p>
              <p className="text-sm text-muted-foreground">
                {FREQUENCIES.includes(med.frequency) ? med.frequency : "Fréquence à préciser"}
                {med.times[0]?.enabled ? ` · rappel à ${med.times[0].time}` : ""}
              </p>
              {med.indications && <p className="mt-1 text-sm">{med.indications}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Modifier ${med.name}`}
              onClick={() => edit(med)}
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Supprimer ${med.name}`}
              onClick={() => void remove(med)}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
      {!meds.length && !form && (
        <p className="mt-5 rounded-2xl bg-mint-soft p-5 text-sm text-muted-foreground">
          Aucun médicament ajouté. Vous pouvez noter ceux qui vous ont été indiqués.
        </p>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Alafia ne recommande aucune dose ni modification de traitement. Les rappels ne fonctionnent
        que lorsque l’application est ouverte.
      </p>
    </section>
  );
}
