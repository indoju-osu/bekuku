import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Boxes,
  CircleCheck,
  Package,
  PackageX,
  Plus,
  Settings,
  Tags,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductImage } from "@/components/ui/ProductImage";
import { useAppData } from "@/store/AppDataContext";
import { formatDate, formatRupiah, stockLabel } from "@/lib/format";
import { imageStoreUsage } from "@/lib/imageStore";

export function AdminOverviewPage() {
  const { products, categories, articles, settings } = useAppData();
  const [usage, setUsage] = useState<{ count: number; bytes: number } | null>(null);

  useEffect(() => {
    void imageStoreUsage().then(setUsage);
  }, [products, articles, settings]);

  const available = products.filter((product) => product.stock > 0).length;
  const outOfStock = products.filter((product) => product.stock <= 0).length;
  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 10);
  const published = articles.filter((article) => article.status === "published").length;
  const drafts = articles.length - published;
  const inventoryValue = products.reduce(
    (total, product) => total + (product.discountPrice ?? product.price) * product.stock,
    0,
  );

  const stats = [
    { label: "Total produk", value: products.length, icon: Package, tone: "bg-navy text-cream" },
    { label: "Total kategori", value: categories.length, icon: Tags, tone: "bg-olive text-white" },
    { label: "Total artikel", value: articles.length, icon: BookOpen, tone: "bg-cream-200 text-navy" },
    { label: "Produk tersedia", value: available, icon: CircleCheck, tone: "bg-olive-soft text-olive-dark" },
    { label: "Produk habis", value: outOfStock, icon: PackageX, tone: "bg-terracotta-soft text-terracotta-dark" },
    { label: "Stok menipis", value: lowStock.length, icon: AlertTriangle, tone: "bg-cream-100 text-navy" },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Ringkasan"
        title="Selamat datang kembali, Admin"
        description={`Pantau performa katalog ${settings.storeName} dan kelola konten toko dengan cepat.`}
        actions={
          <>
            <Link to="/admin/produk" className="btn btn-primary btn-sm">
              <Plus className="size-4" aria-hidden /> Tambah produk
            </Link>
            <Link to="/admin/pengaturan" className="btn btn-secondary btn-sm">
              <Settings className="size-4" aria-hidden /> Pengaturan
            </Link>
          </>
        }
      />

      <section aria-label="Statistik toko" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4 p-5">
            <span className={`flex size-11 items-center justify-center rounded-2xl ${stat.tone}`}>
              <stat.icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">{stat.label}</p>
              <p className="font-display text-2xl text-navy">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <section className="card p-5" aria-label="Produk stok menipis">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">Perlu perhatian</h2>
            <Link to="/admin/stok" className="text-xs font-semibold text-navy hover:text-terracotta-dark">
              Kelola stok
            </Link>
          </div>
          <p className="mt-1 text-xs text-muted">
            Produk dengan stok habis atau tersisa 10 paket atau kurang.
          </p>

          {lowStock.length === 0 && outOfStock === 0 ? (
            <p className="mt-5 rounded-2xl bg-olive-soft px-4 py-6 text-center text-sm text-olive-dark">
              Semua produk memiliki stok yang aman.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-navy/8">
              {[...outOfStock ? products.filter((p) => p.stock <= 0) : [], ...lowStock]
                .slice(0, 6)
                .map((product) => {
                  const stock = stockLabel(product.stock);
                  return (
                    <li key={product.id} className="flex items-center gap-3 py-3">
                      <span className="size-11 shrink-0 overflow-hidden rounded-xl">
                        <ProductImage image={product.image} alt={product.name} className="size-full" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-navy">{product.name}</p>
                        <p className="text-[11px] text-muted">{product.weight}</p>
                      </div>
                      <span className={`chip !py-0.5 text-[10px] ${stock.tone}`}>{stock.label}</span>
                    </li>
                  );
                })}
            </ul>
          )}
        </section>

        <div className="space-y-5">
          <section className="card p-5" aria-label="Ringkasan konten">
            <h2 className="font-display text-xl">Konten microblog</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal/70">Terbit</dt>
                <dd className="font-semibold text-navy">{published}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/70">Draf (tidak tampil publik)</dt>
                <dd className="font-semibold text-navy">{drafts}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/70">Nilai persediaan</dt>
                <dd className="font-semibold text-navy">{formatRupiah(inventoryValue)}</dd>
              </div>
            </dl>
            <Link
              to="/admin/artikel"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:text-terracotta-dark"
            >
              <BookOpen className="size-3.5" aria-hidden /> Kelola artikel
            </Link>
          </section>

          <section className="card p-5" aria-label="Aktivitas terakhir">
            <h2 className="font-display text-xl">Aktivitas terbaru</h2>
            <ul className="mt-3 space-y-2.5 text-xs">
              {[...products]
                .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
                .slice(0, 3)
                .map((product) => (
                  <li key={product.id} className="flex items-start gap-2">
                    <Boxes className="mt-0.5 size-3.5 shrink-0 text-olive" aria-hidden />
                    <span className="text-charcoal/75">
                      <span className="font-medium text-navy">{product.name}</span> diperbarui{" "}
                      {formatDate(product.updatedAt)}
                    </span>
                  </li>
                ))}
              {[...articles]
                .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
                .slice(0, 2)
                .map((article) => (
                  <li key={article.id} className="flex items-start gap-2">
                    <BookOpen className="mt-0.5 size-3.5 shrink-0 text-olive" aria-hidden />
                    <span className="text-charcoal/75">
                      Artikel <span className="font-medium text-navy">{article.title}</span>{" "}
                      {article.status === "draft" ? "masih draf" : "dipublikasikan"}
                    </span>
                  </li>
                ))}
            </ul>
            {usage && (
              <p className="mt-4 border-t border-navy/8 pt-3 text-[11px] text-muted">
                Penyimpanan gambar: {usage.count} berkas ·{" "}
                {(usage.bytes / (1024 * 1024)).toFixed(1)} MB di IndexedDB
              </p>
            )}
          </section>

          <Link
            to="/"
            className="card flex items-center justify-between gap-3 p-5 transition hover:border-navy/20"
          >
            <span>
              <span className="block text-sm font-semibold text-navy">Lihat website publik</span>
              <span className="block text-xs text-muted">Periksa tampilan katalog terbaru</span>
            </span>
            <ArrowUpRight className="size-4 text-navy" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
