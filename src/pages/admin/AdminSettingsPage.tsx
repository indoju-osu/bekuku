import { useState } from "react";
import { AlertTriangle, Database, RotateCcw, Save, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { seedSettings } from "@/data/seed";
import { useAppData } from "@/store/AppDataContext";
import { useToast } from "@/store/ToastContext";
import { normaliseWhatsapp } from "@/lib/format";
import type { StoreSettings } from "@/types";

type FieldKey = Exclude<keyof StoreSettings, "logo">;

export function AdminSettingsPage() {
  const { settings, updateSettings, resetDemoData, products, categories, articles } = useAppData();
  const { notify } = useToast();
  const [form, setForm] = useState<StoreSettings>(settings);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [confirmReset, setConfirmReset] = useState(false);

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    if (form.storeName.trim().length < 3) nextErrors.storeName = "Nama toko minimal 3 karakter.";
    const wa = normaliseWhatsapp(form.whatsapp);
    if (!/^62\d{8,14}$/.test(wa)) {
      nextErrors.whatsapp = "Nomor WhatsApp tidak valid. Contoh: 081234567890.";
    }
    if (!form.address.trim()) nextErrors.address = "Alamat toko wajib diisi.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Format email tidak valid.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      notify("Periksa kembali pengaturan yang ditandai merah.", "error");
      return;
    }
    const result = updateSettings({ ...form, whatsapp: wa });
    notify(result.ok ? "Pengaturan toko berhasil disimpan." : result.error, result.ok ? "success" : "error");
  };

  const fields: { key: FieldKey; label: string; type?: string; placeholder?: string; textarea?: boolean; help?: string }[] = [
    { key: "storeName", label: "Nama toko", placeholder: "Toko Frozen Food" },
    { key: "tagline", label: "Tagline singkat", placeholder: "Beku Segar, Siap Saji" },
    { key: "whatsapp", label: "Nomor WhatsApp", placeholder: "081234567890", help: "Nomor ini dipakai untuk checkout WhatsApp." },
    { key: "email", label: "Email kontak", type: "email", placeholder: "halo@tokofrozenfood.id" },
    { key: "instagram", label: "URL Instagram", placeholder: "https://instagram.com/…" },
    { key: "facebook", label: "URL Facebook", placeholder: "https://facebook.com/…" },
    { key: "tiktok", label: "URL TikTok", placeholder: "https://tiktok.com/@…" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pengaturan"
        title="Informasi toko"
        description="Semua pengaturan ini dipakai pada header, footer, halaman tentang, dan pesan checkout WhatsApp."
      />

      <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[1.5fr_1fr] xl:items-start" noValidate>
        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="font-display text-xl">Identitas toko</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {fields.slice(0, 2).map((field) => (
                <div key={field.key} className="sm:col-span-1">
                  <label htmlFor={`setting-${field.key}`} className="field-label">
                    {field.label}
                  </label>
                  <input
                    id={`setting-${field.key}`}
                    className="field"
                    value={form[field.key] as string}
                    onChange={(event) => set(field.key, event.target.value as never)}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(errors[field.key])}
                  />
                  {errors[field.key] && (
                    <p className="mt-1 text-xs text-terracotta-dark">{errors[field.key]}</p>
                  )}
                </div>
              ))}
              <div className="sm:col-span-2">
                <label htmlFor="setting-description" className="field-label">
                  Deskripsi toko
                </label>
                <textarea
                  id="setting-description"
                  className="field min-h-24 resize-y"
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="setting-shipping" className="field-label">
                  Catatan pengiriman
                </label>
                <textarea
                  id="setting-shipping"
                  className="field min-h-16 resize-y"
                  value={form.shippingNote}
                  onChange={(event) => set("shippingNote", event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-xl">Kontak & operasional</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {fields.slice(2, 4).map((field) => (
                <div key={field.key}>
                  <label htmlFor={`setting-${field.key}`} className="field-label">
                    {field.label}
                  </label>
                  <input
                    id={`setting-${field.key}`}
                    type={field.type ?? "text"}
                    className="field"
                    value={form[field.key] as string}
                    onChange={(event) => set(field.key, event.target.value as never)}
                    placeholder={field.placeholder}
                    aria-invalid={Boolean(errors[field.key])}
                  />
                  {errors[field.key] ? (
                    <p className="mt-1 text-xs text-terracotta-dark">{errors[field.key]}</p>
                  ) : (
                    field.help && <p className="mt-1 text-[11px] text-muted">{field.help}</p>
                  )}
                </div>
              ))}
              <div className="sm:col-span-2">
                <label htmlFor="setting-address" className="field-label">
                  Alamat toko
                </label>
                <textarea
                  id="setting-address"
                  className="field min-h-16 resize-y"
                  value={form.address}
                  onChange={(event) => set("address", event.target.value)}
                  aria-invalid={Boolean(errors.address)}
                />
                {errors.address && <p className="mt-1 text-xs text-terracotta-dark">{errors.address}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="setting-hours" className="field-label">
                  Jam operasional
                </label>
                <textarea
                  id="setting-hours"
                  className="field min-h-16 resize-y whitespace-pre-line"
                  value={form.hours}
                  onChange={(event) => set("hours", event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-xl">Media sosial</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {fields.slice(4).map((field) => (
                <div key={field.key}>
                  <label htmlFor={`setting-${field.key}`} className="field-label">
                    {field.label}
                  </label>
                  <input
                    id={`setting-${field.key}`}
                    className="field"
                    value={form[field.key] as string}
                    onChange={(event) => set(field.key, event.target.value as never)}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">
              <Save className="size-4" aria-hidden /> Simpan pengaturan
            </button>
          </div>
        </div>

        <div className="space-y-5 xl:sticky xl:top-24">
          <section className="card p-5">
            <h2 className="font-display text-xl">Logo toko</h2>
            <p className="mt-1 text-xs text-muted">
              Unggah logo persegi (disarankan 512×512). Bila kosong, dipakai ikon salju bawaan.
            </p>
            <div className="mt-4">
              <ImageUploader
                value={form.logo}
                onChange={(next) => set("logo", next)}
                label="Logo"
                aspect="square"
                hint="PNG transparan lebih disarankan"
              />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-xl">Data demonstrasi</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Seluruh data ({products.length} produk, {categories.length} kategori, {articles.length} artikel)
              tersimpan di localStorage peramban ini, foto unggahan di IndexedDB.
            </p>
            <ul className="mt-3 space-y-1.5 text-[11px] text-charcoal/70">
              <li className="flex gap-2">
                <Database className="mt-0.5 size-3.5 shrink-0 text-olive" aria-hidden /> Reset akan
                mengembalikan data contoh awal.
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-terracotta-dark" aria-hidden /> Foto
                unggahan akan terhapus dari IndexedDB.
              </li>
            </ul>
            <button type="button" onClick={() => setConfirmReset(true)} className="btn btn-secondary btn-sm mt-4 w-full">
              <RotateCcw className="size-3.5" aria-hidden /> Reset data demonstrasi
            </button>
          </section>

          <section className="rounded-2xl border border-navy/10 bg-cream-100 p-5">
            <h2 className="flex items-center gap-2 font-display text-lg">
              <ShieldAlert className="size-4 text-terracotta-dark" aria-hidden /> Catatan keamanan
            </h2>
            <p className="mt-2 text-[11px] leading-relaxed text-charcoal/70">
              Login demo (admin/admin) dan penyimpanan di peramban hanya untuk demonstrasi. Untuk produksi
              diperlukan backend autentikasi, password hashing (mis. bcrypt/argon2), session server yang aman,
              validasi gambar di server, serta object storage untuk foto.
            </p>
          </section>
        </div>
      </form>

      <ConfirmDialog
        open={confirmReset}
        title="Reset seluruh data demonstrasi?"
        description="Produk, kategori, artikel, pengaturan, keranjang, dan foto unggahan akan dikembalikan ke data contoh awal. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, reset data"
        onConfirm={async () => {
          await resetDemoData();
          setForm(seedSettings);
          setConfirmReset(false);
          notify("Data demonstrasi berhasil direset.", "success");
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
