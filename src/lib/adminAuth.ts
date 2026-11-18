import { readJson, removeKey, STORAGE_KEYS, writeJson } from "@/lib/storage";

const DEMO_USER = "admin";
const DEMO_PASSWORD = "admin";

export interface AdminSession {
  username: string;
  loggedInAt: string;
}

export function signIn(username: string, password: string): { ok: boolean; error?: string } {
  if (!username.trim() || !password.trim()) {
    return { ok: false, error: "Username dan password wajib diisi." };
  }
  if (username.trim().toLowerCase() !== DEMO_USER || password !== DEMO_PASSWORD) {
    return { ok: false, error: "Username atau password salah. Gunakan akun demo admin / admin." };
  }
  const session: AdminSession = { username: DEMO_USER, loggedInAt: new Date().toISOString() };
  const result = writeJson(STORAGE_KEYS.session, session);
  if (!result.ok) return { ok: false, error: "Sesi gagal disimpan pada peramban ini." };
  return { ok: true };
}

export function getSession(): AdminSession | null {
  const session = readJson<AdminSession | null>(STORAGE_KEYS.session, null);
  if (!session || session.username !== DEMO_USER) return null;
  return session;
}

export function signOut(): void {
  removeKey(STORAGE_KEYS.session);
}

export const DEMO_CREDENTIALS = { username: DEMO_USER, password: DEMO_PASSWORD };
