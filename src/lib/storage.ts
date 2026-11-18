/**
 * Small persistence layer on top of localStorage.
 *
 * Everything is namespaced and versioned so a future backend can replace this
 * module without touching the UI code. Failures (quota, private mode) are
 * returned rather than thrown so the UI can explain what happened.
 */

export const STORAGE_KEYS = {
  products: "tff.v1.products",
  categories: "tff.v1.categories",
  articles: "tff.v1.articles",
  settings: "tff.v1.settings",
  cart: "tff.v1.cart",
  session: "tff.v1.admin-session",
  seeded: "tff.v1.seeded",
} as const;

export type WriteResult = { ok: true } | { ok: false; error: string };

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): WriteResult {
  if (typeof window === "undefined") return { ok: false, error: "Penyimpanan tidak tersedia." };
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22);
    return {
      ok: false,
      error: isQuota
        ? "Penyimpanan lokal penuh. Hapus beberapa gambar atau produk lama, lalu coba lagi."
        : "Data gagal disimpan pada peramban ini.",
    };
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function isStorageAvailable(): boolean {
  try {
    const probe = "__tff_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
