import { useState } from "react";
import { Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppData } from "@/store/AppDataContext";
import { useToast } from "@/store/ToastContext";
import type { Category } from "@/types";

export function AdminCategoriesPage() {
  const { categories, products, saveCategory, deleteCategory } = useAppData();
  const { notify } = useToast();
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setError(null);
  };

  const startEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setDescription(category.description);
    setError(null);
    document.getElementById("kategori-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = saveCategory({ name, description }, editing?.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    notify(editing ? "Kategori berhasil diperbarui." : "Kategori baru ditambahkan.", "success");
    resetForm();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manajemen kategori"
        title="Kategori produk"
        description="Kategori membantu pelanggan menemukan produk. Kategori yang masih dipakai produk tidak dapat dihapus."
        actions={
          <button type="button" onClick={resetForm} className="btn btn-secondary btn-sm">
            <Plus className="size-4" aria-hidden /> Kategori baru
          </button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr] xl:items-start">
        <section aria-label="Daftar kategori" className="space-y-3">
          {categories.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-12 text-center">
              <Tags className="size-7 text-olive" aria-hidden />
              <p className="mt-3 font-display text-lg">Belum ada kategori</p>
              <p className="mt-1 text-sm text-charcoal/65">Tambahkan kategori melalui formulir di samping.</p>
            </div>
          ) : (
            categories.map((category) => {
              const used = products.filter((product) => product.categoryId === category.id).length;
              return (
                <article key={category.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-navy">
                    <Tags className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg">{category.name}</h2>
                      <span className="chip bg-olive-soft !py-0.5 text-[10px] text-olive-dark">
                        {used} produk
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted">/produk?kategori={category.slug}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-charcoal/65">{category.description}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="rounded-lg border border-navy/12 p-2 text-navy transition hover:bg-cream-50"
                      aria-label={`Edit kategori ${category.name}`}
                    >
                      <Pencil className="size-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(category)}
                      className="rounded-lg border border-terracotta/30 p-2 text-terracotta-dark transition hover:bg-terracotta-soft"
                      aria-label={`Hapus kategori ${category.name}`}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section id="kategori-form" className="card p-5 xl:sticky xl:top-24" aria-label="Formulir kategori">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-xl">{editing ? "Edit kategori" : "Kategori baru"}</h2>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full p-1.5 text-muted hover:bg-navy/5"
                aria-label="Batalkan edit"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
            <div>
              <label htmlFor="kategori-nama" className="field-label">
                Nama kategori <span className="text-terracotta-dark">*</span>
              </label>
              <input
                id="kategori-nama"
                className="field"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError(null);
                }}
                placeholder="Contoh: Camilan Beku"
                aria-invalid={Boolean(error)}
              />
            </div>
            <div>
              <label htmlFor="kategori-deskripsi" className="field-label">
                Deskripsi singkat
              </label>
              <textarea
                id="kategori-deskripsi"
                className="field min-h-20 resize-y"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Jelaskan jenis produk dalam kategori ini."
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-terracotta-soft px-3 py-2 text-xs text-terracotta-dark">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                {editing ? "Simpan perubahan" : "Tambah kategori"}
              </button>
              {editing && (
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus kategori?"
        description={
          <>
            Kategori <strong className="text-navy">{pendingDelete?.name}</strong> akan dihapus permanen.
            Kategori yang masih dipakai produk akan ditolak sistem.
          </>
        }
        confirmLabel="Hapus kategori"
        onConfirm={() => {
          if (!pendingDelete) return;
          const result = deleteCategory(pendingDelete.id);
          notify(result.ok ? "Kategori berhasil dihapus." : result.error, result.ok ? "success" : "error");
          if (result.ok && editing?.id === pendingDelete.id) resetForm();
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
