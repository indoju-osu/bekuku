import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageSearch, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/public/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useAppData } from "@/store/AppDataContext";
import { discountedPrice } from "@/lib/format";
import type { Product } from "@/types";

type SortKey = "populer" | "termurah" | "termahal" | "terbaru" | "diskon";
type StockFilter = "semua" | "tersedia" | "habis";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "populer", label: "Paling populer" },
  { value: "termurah", label: "Harga terendah" },
  { value: "termahal", label: "Harga tertinggi" },
  { value: "terbaru", label: "Terbaru" },
  { value: "diskon", label: "Diskon terbesar" },
];

const STOCK_FILTERS: { value: StockFilter; label: string }[] = [
  { value: "semua", label: "Semua stok" },
  { value: "tersedia", label: "Stok tersedia" },
  { value: "habis", label: "Stok habis" },
];

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case "termurah":
      return copy.sort((a, b) => discountedPrice(a) - discountedPrice(b));
    case "termahal":
      return copy.sort((a, b) => discountedPrice(b) - discountedPrice(a));
    case "terbaru":
      return copy.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    case "diskon":
      return copy.sort((a, b) => {
        const discount = (product: Product) =>
          product.discountPrice ? 1 - product.discountPrice / product.price : 0;
        return discount(b) - discount(a);
      });
    case "populer":
    default:
      return copy.sort((a, b) => b.sold - a.sold);
  }
}

export function CatalogPage() {
  const { products, categories } = useAppData();
  const [params, setParams] = useSearchParams();

  const query = params.get("q") ?? "";
  const categorySlug = params.get("kategori") ?? "";
  const sort = (params.get("urutkan") as SortKey) || "populer";
  const stock = (params.get("stok") as StockFilter) || "semua";
  const promoOnly = params.get("promo") === "1";

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    let list = products.filter((product) => product.status === "active");
    if (categorySlug) {
      const category = categories.find((item) => item.slug === categorySlug);
      list = list.filter((product) => product.categoryId === category?.id);
    }
    if (term) {
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term),
      );
    }
    if (stock === "tersedia") list = list.filter((product) => product.stock > 0);
    if (stock === "habis") list = list.filter((product) => product.stock <= 0);
    if (promoOnly) list = list.filter((product) => Boolean(product.discountPrice));
    return sortProducts(list, sort);
  }, [products, categories, categorySlug, query, stock, promoOnly, sort]);

  const activeCategory = categories.find((item) => item.slug === categorySlug);
  const hasFilters = Boolean(query || categorySlug || stock !== "semua" || promoOnly);

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        eyebrow="Katalog produk"
        title={activeCategory ? activeCategory.name : "Semua produk frozen food"}
        description={
          activeCategory
            ? activeCategory.description
            : "Pilih produk sesuai kebutuhan, saring berdasarkan kategori, harga, dan ketersediaan stok."
        }
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside aria-label="Filter produk" className="space-y-6">
          <div className="card p-4">
            <label htmlFor="search-produk" className="field-label">
              Cari produk
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                id="search-produk"
                type="search"
                value={query}
                onChange={(event) => update("q", event.target.value || null)}
                placeholder="Nugget, dimsum, udang…"
                className="field !pl-9"
              />
            </div>
          </div>

          <div className="card p-4">
            <p className="field-label flex items-center gap-2">
              <SlidersHorizontal className="size-3.5" aria-hidden /> Kategori
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update("kategori", null)}
                className={`chip border transition ${
                  !categorySlug
                    ? "border-navy bg-navy text-offwhite"
                    : "border-navy/12 bg-white text-charcoal hover:border-navy/30"
                }`}
                aria-pressed={!categorySlug}
              >
                Semua
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => update("kategori", category.slug)}
                  className={`chip border transition ${
                    categorySlug === category.slug
                      ? "border-navy bg-navy text-offwhite"
                      : "border-navy/12 bg-white text-charcoal hover:border-navy/30"
                  }`}
                  aria-pressed={categorySlug === category.slug}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <label htmlFor="filter-stok" className="field-label">
              Ketersediaan stok
            </label>
            <select
              id="filter-stok"
              className="field"
              value={stock}
              onChange={(event) => update("stok", event.target.value === "semua" ? null : event.target.value)}
            >
              {STOCK_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-charcoal/80">
              <input
                type="checkbox"
                checked={promoOnly}
                onChange={(event) => update("promo", event.target.checked ? "1" : null)}
                className="size-4 rounded border-navy/25 accent-terracotta"
              />
              Hanya produk promo
            </label>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={() => setParams(new URLSearchParams(), { replace: true })}
              className="btn btn-ghost btn-sm w-full"
            >
              <X className="size-4" aria-hidden /> Reset filter
            </button>
          )}

          <div className="rounded-2xl bg-cream-100 p-4 text-xs leading-relaxed text-charcoal/70">
            <p className="font-semibold text-navy">Butuh bantuan memilih?</p>
            <p className="mt-1">
              Hubungi admin melalui WhatsApp untuk rekomendasi paket sesuai jumlah anggota keluarga.
            </p>
          </div>
        </aside>

        {/* Results */}
        <section aria-live="polite">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-charcoal/70">
              Menampilkan <span className="font-semibold text-navy">{filtered.length}</span> produk
              {activeCategory ? ` di ${activeCategory.name}` : ""}
              {query ? ` untuk “${query}”` : ""}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-produk" className="text-xs font-medium text-muted">
                Urutkan
              </label>
              <select
                id="sort-produk"
                className="field !w-auto !py-2 text-sm"
                value={sort}
                onChange={(event) => update("urutkan", event.target.value)}
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-navy/15 bg-white/60 px-6 py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-cream-100 text-olive-dark">
                <PackageSearch className="size-7" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-xl">Produk tidak ditemukan</h3>
              <p className="mt-2 max-w-sm text-sm text-charcoal/65">
                Coba ubah kata kunci, pilih kategori lain, atau hapus filter stok yang sedang aktif.
              </p>
              <button
                type="button"
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
                className="btn btn-primary btn-sm mt-5"
              >
                Tampilkan semua produk
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 3} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
