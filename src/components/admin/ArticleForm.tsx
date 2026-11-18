import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useAppData, type ArticleInput } from "@/store/AppDataContext";
import { slugify } from "@/lib/format";
import type { Article, ImageRef } from "@/types";

interface ArticleFormProps {
  open: boolean;
  article: Article | null;
  onClose: () => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}

interface FormState {
  title: string;
  excerpt: string;
  content: string;
  image: ImageRef;
  status: Article["status"];
  publishedAt: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyState = (): FormState => ({
  title: "",
  excerpt: "",
  content: "",
  image: null,
  status: "draft",
  publishedAt: today(),
});

export function ArticleForm({ open, article, onClose, onSaved, onError }: ArticleFormProps) {
  const { saveArticle, articles } = useAppData();
  const [form, setForm] = useState<FormState>(emptyState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (article) {
      setForm({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        image: article.image,
        status: article.status,
        publishedAt: article.publishedAt.slice(0, 10),
      });
    } else {
      setForm(emptyState());
    }
    setErrors({});
  }, [open, article]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const slugPreview = slugify(form.title) || "judul-artikel";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (form.title.trim().length < 5) nextErrors.title = "Judul minimal 5 karakter.";
    if (form.excerpt.trim().length < 20) nextErrors.excerpt = "Ringkasan minimal 20 karakter.";
    if (form.content.trim().length < 60) nextErrors.content = "Isi artikel minimal 60 karakter.";
    const duplicate = articles.some((item) => item.slug === slugPreview && item.id !== article?.id);
    if (duplicate) nextErrors.title = "Judul menghasilkan slug yang sudah dipakai.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      onError("Periksa kembali isian artikel yang ditandai merah.");
      return;
    }

    const publishedIso = new Date(`${form.publishedAt}T03:00:00.000Z`).toISOString();
    const payload: ArticleInput = {
      title: form.title.trim(),
      slug: slugPreview,
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      image: form.image,
      status: form.status,
      publishedAt: publishedIso,
    };
    setSaving(true);
    const result = saveArticle(payload, article?.id);
    setSaving(false);
    if (!result.ok) {
      onError(result.error);
      return;
    }
    onSaved(article ? "Artikel berhasil diperbarui." : "Artikel baru berhasil disimpan.");
  };

  return (
    <div className="fixed inset-0 z-90 flex items-start justify-center overflow-y-auto bg-navy/50 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-form-title"
        className="my-6 w-full max-w-3xl rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-navy/8 px-5 py-4">
          <h2 id="article-form-title" className="font-display text-xl">
            {article ? "Edit artikel" : "Tulis artikel baru"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted transition hover:bg-navy/5"
            aria-label="Tutup formulir"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto px-5 py-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
            <ImageUploader value={form.image} onChange={(next) => set("image", next)} label="Foto artikel" />

            <div className="space-y-4">
              <div>
                <label htmlFor="article-title" className="field-label">
                  Judul artikel <span className="text-terracotta-dark">*</span>
                </label>
                <input
                  id="article-title"
                  className="field"
                  value={form.title}
                  onChange={(event) => set("title", event.target.value)}
                  aria-invalid={Boolean(errors.title)}
                  placeholder="Contoh: Tips menyimpan frozen food"
                />
                {errors.title ? (
                  <p className="mt-1 text-xs text-terracotta-dark">{errors.title}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-muted">Slug: /artikel/{slugPreview}</p>
                )}
              </div>

              <div>
                <label htmlFor="article-excerpt" className="field-label">
                  Ringkasan <span className="text-terracotta-dark">*</span>
                </label>
                <textarea
                  id="article-excerpt"
                  className="field min-h-16 resize-y"
                  value={form.excerpt}
                  onChange={(event) => set("excerpt", event.target.value)}
                  aria-invalid={Boolean(errors.excerpt)}
                  placeholder="Dua kalimat ringkas yang tampil pada kartu artikel."
                />
                {errors.excerpt && <p className="mt-1 text-xs text-terracotta-dark">{errors.excerpt}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="article-status" className="field-label">
                    Status
                  </label>
                  <select
                    id="article-status"
                    className="field"
                    value={form.status}
                    onChange={(event) => set("status", event.target.value as Article["status"])}
                  >
                    <option value="draft">Draf — hanya admin</option>
                    <option value="published">Published — tampil publik</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="article-date" className="field-label">
                    Tanggal publikasi
                  </label>
                  <input
                    id="article-date"
                    type="date"
                    className="field"
                    value={form.publishedAt}
                    onChange={(event) => set("publishedAt", event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="article-content" className="field-label">
              Isi artikel <span className="text-terracotta-dark">*</span>
            </label>
            <textarea
              id="article-content"
              className="field min-h-48 resize-y leading-relaxed"
              value={form.content}
              onChange={(event) => set("content", event.target.value)}
              aria-invalid={Boolean(errors.content)}
              placeholder="Tulis isi artikel. Pisahkan paragraf dengan satu baris kosong."
            />
            {errors.content ? (
              <p className="mt-1 text-xs text-terracotta-dark">{errors.content}</p>
            ) : (
              <p className="mt-1 text-[11px] text-muted">
                Pisahkan paragraf dengan baris kosong agar tampil rapi di halaman publik.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-navy/8 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save className="size-4" aria-hidden /> {saving ? "Menyimpan…" : "Simpan artikel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
