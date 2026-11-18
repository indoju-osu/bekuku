import { useMemo, useState } from "react";
import { PackagePlus, Pencil, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProductImage } from "@/components/ui/ProductImage";
import { useAppData } from "@/store/AppDataContext";
import { useToast } from "@/store/ToastContext";
import { formatRupiah, stockLabel } from "@/lib/format";
import type { Product } from "@/types";

type StatusFilter = "semua" | "active" | "draft";

export function AdminProductsPage() {
  const { products, categories, categoryById, deleteProduct } = useAppData();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [sort, setSort] = useState<"terbaru" | "nama" | "stok">("terbaru");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    let list = [...products];
    if (term) list = list.filter((product) => product.name.toLowerCase().includes(term));
    if (categoryFilter) list = list.filter((product) => product.categoryId === categoryFilter);
    if (statusFilter !== "semua") list = list.filter((product) => product.status === statusFilter);
    switch (sort) {
      case "nama":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "stok":
        return list.sort((a, b) => a.stock - b.stock);
      default:
        return list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    }
  }, [products, query, categoryFilter, statusFilter, sort]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manajemen produk"
        title="Daftar produk"
        description="Tambah, ubah, dan hapus produk. Perubahan langsung tampil pada katalog publik."
        actions={
          <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
            <PackagePlus className="size-4" aria-hidden /> Tambah produk
          </button>
        }
      />

      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <label htmlFor="cari-produk-admin" className="field-label">
              Cari
            </label>
            <Search className="pointer-events-none absolute left-3 top-[2.4rem] size-4 text-muted" aria-hidden />
            <input
              id="cari-produk-admin"
              className="field !pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nama produk"
              type="search"
            />
          </div>
          <div>
            <label htmlFor="filter-kategori-admin" className="field-label">
              Kategori
            </label>
            <select
              id="filter-kategori-admin"
              className="field"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="">Semua kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-status-admin" className="field-label">
              Status
            </label>
            <select
              id="filter-status-admin"
              className="field"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="semua">Semua status</option>
              <option value="active">Aktif</option>
              <option value="draft">Draf</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort-produk-admin" className="field-label">
              Urutkan
            </label>
            <select
              id="sort-produk-admin"
              className="field"
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
            >
              <option value="terbaru">Terbaru</option>
              <option value="nama">Nama A–Z</option>
              <option value="stok">Stok tersedikit</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">{filtered.length} produk ditampilkan.</p>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <PackagePlus className="size-8 text-olive" aria-hidden />
          <h2 className="mt-3 font-display text-xl">Belum ada produk yang cocok</h2>
          <p className="mt-1 max-w-sm text-sm text-charcoal/65">
            Ubah kata kunci atau filter, maupun tambahkan produk baru ke katalog.
          </p>
          <button type="button" onClick={openCreate} className="btn btn-primary btn-sm mt-5">
            Tambah produk
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-navy/8 bg-white lg:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Daftar produk toko</caption>
              <thead className="bg-cream-50 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Produk</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Kategori</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Harga</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Stok</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/8">
                {filtered.map((product) => {
                  const stock = stockLabel(product.stock);
                  return (
                    <tr key={product.id} className="hover:bg-cream-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="size-12 shrink-0 overflow-hidden rounded-xl">
                            <ProductImage image={product.image} alt={product.name} className="size-full" />
                          </span>
                          <span>
                            <span className="block font-medium text-navy">{product.name}</span>
                            <span className="block text-[11px] text-muted">
                              {product.weight} · /produk/{product.slug}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-charcoal/70">
                        {categoryById(product.categoryId)?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="block font-medium text-navy">
                          {formatRupiah(product.discountPrice ?? product.price)}
                        </span>
                        {product.discountPrice && (
                          <span className="block text-[11px] text-muted line-through">
                            {formatRupiah(product.price)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`chip !py-0.5 text-[10px] ${stock.tone}`}>{stock.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`chip !py-0.5 text-[10px] ${
                            product.status === "active"
                              ? "bg-olive-soft text-olive-dark"
                              : "bg-cream-200 text-navy/70"
                          }`}
                        >
                          {product.status === "active" ? "Aktif" : "Draf"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="rounded-lg border border-navy/12 p-2 text-navy transition hover:bg-cream-50"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="size-3.5" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(product)}
                            className="rounded-lg border border-terracotta/30 p-2 text-terracotta-dark transition hover:bg-terracotta-soft"
                            aria-label={`Hapus ${product.name}`}
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {filtered.map((product) => {
              const stock = stockLabel(product.stock);
              return (
                <li key={product.id} className="card p-4">
                  <div className="flex gap-3">
                    <span className="size-16 shrink-0 overflow-hidden rounded-xl">
                      <ProductImage image={product.image} alt={product.name} className="size-full" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-navy">{product.name}</p>
                      <p className="text-[11px] text-muted">
                        {categoryById(product.categoryId)?.name} · {product.weight}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-navy">
                        {formatRupiah(product.discountPrice ?? product.price)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className={`chip !py-0.5 text-[10px] ${stock.tone}`}>{stock.label}</span>
                        <span className="chip !py-0.5 text-[10px] bg-cream-200 text-navy/70">
                          {product.status === "active" ? "Aktif" : "Draf"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => openEdit(product)} className="btn btn-secondary btn-sm flex-1">
                      <Pencil className="size-3.5" aria-hidden /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(product)}
                      className="btn btn-ghost btn-sm flex-1 !text-terracotta-dark"
                    >
                      <Trash2 className="size-3.5" aria-hidden /> Hapus
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <ProductForm
        open={formOpen}
        product={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(message) => {
          setFormOpen(false);
          notify(message, "success");
        }}
        onError={(message) => notify(message, "error")}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus produk ini?"
        description={
          <>
            <strong className="text-navy">{pendingDelete?.name}</strong> akan dihapus dari katalog dan
            keranjang pelanggan. Tindakan ini tidak dapat dibatalkan.
          </>
        }
        confirmLabel="Hapus produk"
        onConfirm={() => {
          if (!pendingDelete) return;
          const result = deleteProduct(pendingDelete.id);
          notify(result.ok ? "Produk berhasil dihapus." : result.error, result.ok ? "success" : "error");
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
