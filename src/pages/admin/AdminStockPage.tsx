import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, Check, Minus, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductImage } from "@/components/ui/ProductImage";
import { useAppData } from "@/store/AppDataContext";
import { useToast } from "@/store/ToastContext";
import { formatRupiah, stockLabel } from "@/lib/format";
import type { Product } from "@/types";

type StockFilter = "semua" | "menipis" | "habis" | "aman";

export function AdminStockPage() {
  const { products, categories, categoryById, saveProduct } = useAppData();
  const { notify } = useToast();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StockFilter>("semua");

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products
      .filter((product) => (term ? product.name.toLowerCase().includes(term) : true))
      .filter((product) => {
        if (filter === "habis") return product.stock <= 0;
        if (filter === "menipis") return product.stock > 0 && product.stock <= 10;
        if (filter === "aman") return product.stock > 10;
        return true;
      })
      .sort((a, b) => a.stock - b.stock);
  }, [products, query, filter]);

  const persistStock = (product: Product, nextStock: number) => {
    const result = saveProduct(
      {
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        weight: product.weight,
        stock: Math.max(0, Math.floor(nextStock)),
        status: product.status,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        sold: product.sold,
        image: product.image,
      },
      product.id,
    );
    if (result.ok) {
      notify(`Stok ${product.name} diperbarui menjadi ${Math.max(0, Math.floor(nextStock))}.`, "success");
      setDrafts((current) => {
        const next = { ...current };
        delete next[product.id];
        return next;
      });
    } else {
      notify(result.error, "error");
    }
  };

  const summary = {
    total: products.length,
    out: products.filter((product) => product.stock <= 0).length,
    low: products.filter((product) => product.stock > 0 && product.stock <= 10).length,
    units: products.reduce((sum, product) => sum + product.stock, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manajemen stok"
        title="Ketersediaan produk"
        description="Perbarui jumlah stok dengan cepat. Stok habis otomatis menonaktifkan tombol tambah ke keranjang."
        actions={
          <span className="chip bg-cream-100 text-navy">
            <Boxes className="size-3.5" aria-hidden /> {summary.units} paket tersedia
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total produk", value: summary.total, tone: "bg-cream-100 text-navy" },
          { label: "Stok menipis", value: summary.low, tone: "bg-olive-soft text-olive-dark" },
          { label: "Stok habis", value: summary.out, tone: "bg-terracotta-soft text-terracotta-dark" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl p-5 ${stat.tone}`}>
            <p className="text-xs uppercase tracking-wide opacity-80">{stat.label}</p>
            <p className="font-display text-2xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card grid gap-3 p-4 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <label htmlFor="cari-stok" className="field-label">
            Cari produk
          </label>
          <Search className="pointer-events-none absolute left-3 top-[2.4rem] size-4 text-muted" aria-hidden />
          <input
            id="cari-stok"
            type="search"
            className="field !pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nama produk"
          />
        </div>
        <div>
          <label htmlFor="filter-stok-admin" className="field-label">
            Tampilkan
          </label>
          <select
            id="filter-stok-admin"
            className="field"
            value={filter}
            onChange={(event) => setFilter(event.target.value as StockFilter)}
          >
            <option value="semua">Semua produk</option>
            <option value="menipis">Stok menipis (≤10)</option>
            <option value="habis">Stok habis</option>
            <option value="aman">Stok aman (&gt;10)</option>
          </select>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <AlertTriangle className="size-8 text-olive" aria-hidden />
          <h2 className="mt-3 font-display text-xl">Tidak ada produk pada filter ini</h2>
          <p className="mt-1 text-sm text-charcoal/65">Ubah filter atau kata kunci pencarian.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((product) => {
            const stock = stockLabel(product.stock);
            const draftValue = drafts[product.id] ?? String(product.stock);
            return (
              <li key={product.id} className="card flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="size-14 shrink-0 overflow-hidden rounded-xl">
                    <ProductImage image={product.image} alt={product.name} className="size-full" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-navy">{product.name}</p>
                    <p className="text-[11px] text-muted">
                      {categoryById(product.categoryId)?.name} · {product.weight} ·{" "}
                      {formatRupiah(product.discountPrice ?? product.price)}
                    </p>
                    <span className={`chip mt-1 !py-0.5 text-[10px] ${stock.tone}`}>{stock.label}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-full border border-navy/15 bg-white">
                    <button
                      type="button"
                      onClick={() => persistStock(product, product.stock - 1)}
                      disabled={product.stock <= 0}
                      className="flex size-9 items-center justify-center rounded-l-full text-navy transition hover:bg-cream/40 disabled:opacity-40"
                      aria-label={`Kurangi stok ${product.name}`}
                    >
                      <Minus className="size-3.5" aria-hidden />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={draftValue}
                      onChange={(event) =>
                        setDrafts((current) => ({ ...current, [product.id]: event.target.value }))
                      }
                      className="w-16 border-x border-navy/10 py-1.5 text-center text-sm font-semibold text-navy focus:outline-none"
                      aria-label={`Jumlah stok ${product.name}`}
                    />
                    <button
                      type="button"
                      onClick={() => persistStock(product, product.stock + 1)}
                      className="flex size-9 items-center justify-center rounded-r-full text-navy transition hover:bg-cream/40"
                      aria-label={`Tambah stok ${product.name}`}
                    >
                      <Plus className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => persistStock(product, Number(draftValue))}
                    className="btn btn-primary btn-sm"
                  >
                    <Check className="size-3.5" aria-hidden /> Simpan
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted">
        {categories.length} kategori aktif. Perubahan stok juga terlihat pada halaman detail produk dan
        validasi keranjang.
      </p>
    </div>
  );
}
