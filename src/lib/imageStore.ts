/**
 * Image storage for admin uploads.
 *
 * Photos live in IndexedDB (not localStorage) because base64 blobs would blow
 * through the ~5 MB localStorage quota almost immediately. The public app reads
 * them back as object URLs; the seed catalogue uses bundled WebP assets.
 */
const DB_NAME = "tff-images";
const DB_VERSION = 1;
const STORE = "images";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export interface StoredImage {
  id: string;
  name: string;
  mime: string;
  size: number;
  createdAt: string;
  blob: Blob;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB tidak tersedia pada peramban ini."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Gagal membuka penyimpanan gambar."));
  });
  return dbPromise;
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Format gambar harus JPG, PNG, WebP, atau AVIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Ukuran gambar maksimal 4 MB. Kompres foto terlebih dahulu.";
  }
  return null;
}

export async function saveImage(file: File): Promise<StoredImage> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);
  const db = await openDb();
  const record: StoredImage = {
    id: `img_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    mime: file.type,
    size: file.size,
    createdAt: new Date().toISOString(),
    blob: file,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Gagal menyimpan gambar."));
  });
  return record;
}

export async function getImage(id: string): Promise<StoredImage | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).get(id);
      request.onsuccess = () => resolve((request.result as StoredImage | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error("Gagal membaca gambar."));
    });
  } catch {
    return null;
  }
}

export async function deleteImage(id: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Gagal menghapus gambar."));
    });
  } catch {
    /* deletion is best effort */
  }
}

export async function clearImages(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    /* ignore */
  }
}

export async function imageStoreUsage(): Promise<{ count: number; bytes: number }> {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).getAll();
      request.onsuccess = () => {
        const rows = (request.result as StoredImage[]) ?? [];
        resolve({ count: rows.length, bytes: rows.reduce((sum, row) => sum + (row.size || 0), 0) });
      };
      request.onerror = () => resolve({ count: 0, bytes: 0 });
    });
  } catch {
    return { count: 0, bytes: 0 };
  }
}
