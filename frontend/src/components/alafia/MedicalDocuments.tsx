import { useEffect, useState, type ChangeEvent } from "react";
import { ExternalLink, FileText, LoaderCircle, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ACCEPTED_TYPES,
  DOC_CATEGORIES,
  MAX_FILE_SIZE,
  deleteFile,
  formatSize,
  listFiles,
  putFile,
  validateFile,
  type DocCategory,
  type FileScope,
  type StoredFile,
} from "@/lib/file-store";
import { newId } from "@/lib/local-store";

function FilePreview({ file }: { file: StoredFile }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file.blob]);

  if (!url) return null;
  if (file.type.startsWith("image/")) {
    return <img src={url} alt={`Aperçu de ${file.name}`} className="mt-3 max-h-48 max-w-full rounded-xl object-contain" />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline">
      <ExternalLink className="size-4" aria-hidden />
      Ouvrir l'aperçu PDF
    </a>
  );
}

export function MedicalDocuments({ scope = "suivi" }: { scope?: Extract<FileScope, "suivi" | "grossesse"> }) {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [category, setCategory] = useState<Exclude<DocCategory, "photo">>("carnet");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setFiles(await listFiles(scope));
      setError("");
    } catch {
      setError("Le stockage des documents est indisponible sur cet appareil.");
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    void refresh();
    // Load once for the selected scope.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await putFile({
        id: newId(),
        name: file.name,
        type: file.type,
        size: file.size,
        scope,
        category,
        addedAt: Date.now(),
        blob: file,
      });
      await refresh();
    } catch {
      setError("Le document n'a pas pu être enregistré. Vérifiez l'espace disponible sur cet appareil.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(file: StoredFile) {
    try {
      await deleteFile(file.id);
      await refresh();
    } catch {
      setError("Le document n'a pas pu être supprimé. Réessayez.");
    }
  }

  return (
    <section id={scope === "suivi" ? "documents" : "documents-grossesse"} className="rounded-3xl border border-border/70 bg-card p-6 shadow-soft md:p-8">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
          <FileText className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-semibold">Documents médicaux</h2>
          <p className="mt-1 text-sm text-muted-foreground">Photos de carnet, ordonnances, recommandations ou PDF (10 Mo maximum).</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor={`document-category-${scope}`}>Type de document</Label>
          <select id={`document-category-${scope}`} value={category} onChange={(e) => setCategory(e.target.value as Exclude<DocCategory, "photo">)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            {Object.entries(DOC_CATEGORIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor={`medical-file-${scope}`} className="sr-only">Choisir un document médical</Label>
          <Button asChild disabled={busy}>
            <label htmlFor={`medical-file-${scope}`} className="cursor-pointer">
              {busy ? <LoaderCircle className="animate-spin" /> : <Upload />}
              {busy ? "Enregistrement…" : "Ajouter un document"}
            </label>
          </Button>
          <input
            id={`medical-file-${scope}`}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            disabled={busy}
            onChange={onFileChange}
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Les fichiers restent dans le stockage local de ce navigateur. Ils ne sont pas transmis à un service externe.</p>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-6">
        {!ready ? (
          <p role="status" className="text-sm text-muted-foreground">Chargement des documents…</p>
        ) : files.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-mint px-4 py-6 text-center text-sm text-muted-foreground">Aucun document enregistré dans cette rubrique.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {files.map((file) => (
              <li key={file.id} className="min-w-0 rounded-2xl border border-border/70 bg-background p-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-5 shrink-0 text-nature-deep" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold">{file.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {DOC_CATEGORIES[file.category as Exclude<DocCategory, "photo">] ?? "Photo"} · {formatSize(file.size)} · {new Date(file.addedAt).toLocaleDateString("fr-FR")}
                    </p>
                    <FilePreview file={file} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => void onDelete(file)} aria-label={`Supprimer ${file.name}`}>
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <span className="sr-only" aria-live="polite">{files.length} document{files.length === 1 ? "" : "s"} enregistré{files.length === 1 ? "" : "s"}</span>
      <span className="sr-only">{MAX_FILE_SIZE}</span>
    </section>
  );
}
