/**
 * Medical documents and photos are kept in the browser's IndexedDB on this device only.
 * They are never sent to an external service. Replace with an authenticated, encrypted
 * backend store before handling real patient records.
 */
export type FileScope = "suivi" | "grossesse" | "medicament";
export type DocCategory = "carnet" | "ordonnance" | "recommandation" | "autre" | "photo";

export const DOC_CATEGORIES: Record<Exclude<DocCategory, "photo">, string> = {
  carnet: "Carnet de santé",
  ordonnance: "Ordonnance",
  recommandation: "Recommandation d'un professionnel",
  autre: "Autre document",
};

export type StoredFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  scope: FileScope;
  category: DocCategory;
  addedAt: number;
  blob: Blob;
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

export function validateFile(file: { size: number; type: string }): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Format non pris en charge (photo JPG, PNG, WEBP ou PDF).";
  if (file.size > MAX_FILE_SIZE) return "Fichier trop volumineux (10 Mo maximum).";
  return null;
}

const DB_NAME = "alafia-files";
const STORE = "files";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("Stockage indisponible"));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Stockage indisponible"));
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Erreur de stockage"));
    tx.oncomplete = () => db.close();
  });
}

export async function listFiles(scope?: FileScope): Promise<StoredFile[]> {
  const all = await run<StoredFile[]>("readonly", (s) => s.getAll() as IDBRequest<StoredFile[]>);
  return all.filter((f) => !scope || f.scope === scope).sort((a, b) => b.addedAt - a.addedAt);
}

export function getFile(id: string) {
  return run<StoredFile | undefined>("readonly", (s) => s.get(id) as IDBRequest<StoredFile | undefined>);
}

export function putFile(file: StoredFile) {
  return run("readwrite", (s) => s.put(file));
}

export function deleteFile(id: string) {
  return run("readwrite", (s) => s.delete(id));
}

export function clearFiles() {
  return run("readwrite", (s) => s.clear());
}

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

