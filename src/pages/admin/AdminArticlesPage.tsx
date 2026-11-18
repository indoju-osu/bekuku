import { useMemo, useState } from "react";
import { BookOpen, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProductImage } from "@/components/ui/ProductImage";
import { useAppData } from "@/store/AppDataContext";
import { useToast } from "@/store/ToastContext";
import { formatDate } from "@/lib/format";
import type { Article } from "@/types";

export function AdminArticlesPage() {
  const { articles, deleteArticle, saveArticle } = useAppData();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"semua" | Article["status"]>("semua");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Article | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return articles
      .filter((article) => (term ? article.title.toLowerCase().includes(term) : true))
      .filter((article) => (status === "semua" ? true : article.status === status))
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }, [articles, query, status]);

  const toggleStatus = (article: Article) => {
    const result = saveArticle(
      {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        image: article.image,
        status: article.status === "published" ? "draft" : "published",
        publishedAt: article.publishedAt,
      },
      article.id,
    );
    notify(
      result.ok
        ? article.status === "published"
          ? "Artikel dikembalikan ke draf."
          : "Artikel dipublikasikan."
        : result.error,
      result.ok ? "success" : "error",
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manajemen microblog"
        title="Artikel & informasi toko"
        description="Tulis promo, tips, dan berita toko. Artikel draf tidak akan tampil pada halaman publik."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus className="size-4" aria-hidden /> Tulis artikel
          </button>
        }
      />

      <div className="card grid gap-3 p-4 sm:grid-cols-2">
        <div className="relative">
          <label htmlFor="cari-artikel" className="field-label">
            Cari artikel
          </label>
          <Search className="pointer-events-none absolute left-3 top-[2.4rem] size-4 text-muted" aria-hidden />
          <input
            id="cari-artikel"
            type="search"
            className="field !pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Judul artikel"
          />
        </div>
        <div>
          <label htmlFor="filter-artikel" className="field-label">
            Status
          </label>
          <select
            id="filter-artikel"
            className="field"
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            <option value="semua">Semua status</option>
            <option value="published">Published</option>
            <option value="draft">Draf</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <BookOpen className="size-8 text-olive" aria-hidden />
          <h2 className="mt-3 font-display text-xl">Belum ada artikel</h2>
          <p className="mt-1 max-w-sm text-sm text-charcoal/65">
            Mulai dengan menulis artikel pertama untuk halaman Microblog.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="btn btn-primary btn-sm mt-5"
          >
            Tulis artikel
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((article) => (
            <li key={article.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <span className="h-28 w-full shrink-0 overflow-hidden rounded-2xl sm:size-24">
                <ProductImage image={article.image} alt={article.title} className="size-full" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`chip !py-0.5 text-[10px] ${
                      article.status === "published"
                        ? "bg-olive-soft text-olive-dark"
                        : "bg-cream-200 text-navy/70"
                    }`}
                  >
                    {article.status === "published" ? "Published" : "Draf"}
                  </span>
                  <span className="text-[11px] text-muted">{formatDate(article.publishedAt)}</span>
                </div>
                <h2 className="mt-1.5 font-display text-lg leading-snug">{article.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-charcoal/65">{article.excerpt}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:flex-col">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(article);
                    setFormOpen(true);
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  <Pencil className="size-3.5" aria-hidden /> Edit
                </button>
                <button type="button" onClick={() => toggleStatus(article)} className="btn btn-ghost btn-sm">
                  {article.status === "published" ? (
                    <>
                      <EyeOff className="size-3.5" aria-hidden /> Jadikan draf
                    </>
                  ) : (
                    <>
                      <Eye className="size-3.5" aria-hidden /> Publikasikan
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(article)}
                  className="btn btn-ghost btn-sm !text-terracotta-dark"
                >
                  <Trash2 className="size-3.5" aria-hidden /> Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ArticleForm
        open={formOpen}
        article={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(message) => {
          setFormOpen(false);
          notify(message, "success");
        }}
        onError={(message) => notify(message, "error")}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus artikel?"
        description={
          <>
            Artikel <strong className="text-navy">{pendingDelete?.title}</strong> akan dihapus permanen dari
            microblog.
          </>
        }
        confirmLabel="Hapus artikel"
        onConfirm={() => {
          if (!pendingDelete) return;
          const result = deleteArticle(pendingDelete.id);
          notify(result.ok ? "Artikel berhasil dihapus." : result.error, result.ok ? "success" : "error");
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
