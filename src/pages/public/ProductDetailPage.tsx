import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Info,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Snowflake,
  Truck,
} from "lucide-react";
import { ProductCard } from "@/components/public/ProductCard";
import { ProductImage } from "@/components/ui/ProductImage";
import { useAppData } from "@/store/AppDataContext";
import { useCart } from "@/store/CartContext";
import { useToast } from "@/store/ToastContext";
import {
  buildWhatsAppUrl,
  discountedPrice,
  discountPercent,
  formatRupiah,
  hasDiscount,
  stockLabel,
} from "@/lib/format";
import { NotFoundPage } from "@/pages/public/NotFoundPage";

export function ProductDetailPage() {
  const { slug } = useParams();
  const { products, categoryById, settings } = useAppData();
  const { addItem } = useCart();
  const { notify } = useToast();
  const [qty, setQty] = useState(1);

  const product = products.find((item) => item.slug === slug && item.status === "active");

  useEffect(() => {
    setQty(1);
  }, [slug]);

  useEffect(() => {
    if (product) document.title = `${product.name} — ${settings.storeName}`;
    return () => {
      document.title = `${settings.storeName} — Frozen Food Berkualitas, Praktis untuk Setiap Momen`;
    };
  }, [product, settings.storeName]);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (item) =>
          item.status === "active" && item.id !== product.id && item.categoryId === product.categoryId,
      )
      .slice(0, 3);
  }, [product, products]);

  if (!product) return <NotFoundPage title="Produk tidak ditemukan" />;

  const category = categoryById(product.categoryId);
  const stock = stockLabel(product.stock);
  const soldOut = product.stock <= 0;
  const maxQty = Math.min(product.stock, 20);
  const price = discountedPrice(product);

  const handleAdd = () => {
    const result = addItem(product.id, qty);
    notify(result.message, result.ok ? "success" : "error");
  };

  const waMessage = `Halo ${settings.storeName}, saya ingin memesan:\n\n*${product.name}*\nJumlah: ${qty}\nHarga: ${formatRupiah(price)} / ${product.weight}\nSubtotal: ${formatRupiah(price * qty)}\n\nApakah stok masih tersedia? Terima kasih.`;
  const waLink = buildWhatsAppUrl(settings.whatsapp, waMessage);

  return (
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link to="/" className="hover:text-navy">
          Beranda
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link to="/produk" className="hover:text-navy">
          Produk
        </Link>
        {category && (
          <>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link to={`/produk?kategori=${category.slug}`} className="hover:text-navy">
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-navy">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div>
          <div className="relative overflow-hidden rounded-4xl border border-navy/8 bg-white shadow-[0_30px_70px_-50px_rgba(15,27,54,0.55)]">
            <ProductImage
              image={product.image}
              alt={product.name}
              priority
              sizes="(max-width: 1024px) 92vw, 560px"
              className="aspect-4/3 w-full"
            />
            <div className="absolute inset-x-4 top-4 flex flex-wrap gap-2">
              {hasDiscount(product) && (
                <span className="chip bg-terracotta text-white">Promo {discountPercent(product)}%</span>
              )}
              {product.isFeatured && <span className="chip bg-white/95 text-navy">Best Seller</span>}
              {product.isNew && <span className="chip bg-olive text-white">New Arrival</span>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: Snowflake, label: "Beku -18°C" },
              { icon: ShieldCheck, label: "Kemasan rapat" },
              { icon: Truck, label: "Armada berpendingin" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-navy/8 bg-white px-2 py-3 text-center"
              >
                <item.icon className="size-4 text-olive-dark" aria-hidden />
                <span className="text-[11px] font-medium text-charcoal/70">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <Link
                to={`/produk?kategori=${category.slug}`}
                className="chip bg-olive-soft text-olive-dark hover:bg-olive/20"
              >
                {category.name}
              </Link>
            )}
            <span className={`chip ${stock.tone}`}>{stock.label}</span>
          </div>

          <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm text-muted">
            Kemasan {product.weight} · Terjual {product.sold}+
          </p>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <span className="font-display text-4xl text-navy">{formatRupiah(price)}</span>
            {hasDiscount(product) && (
              <>
                <span className="pb-1 text-base text-muted line-through">{formatRupiah(product.price)}</span>
                <span className="mb-1.5 rounded-full bg-terracotta-soft px-2.5 py-1 text-xs font-semibold text-terracotta-dark">
                  Hemat {formatRupiah(product.price - price)}
                </span>
              </>
            )}
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-charcoal/75">{product.description}</p>

          <div className="mt-6 rounded-3xl border border-navy/8 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="field-label">Jumlah</p>
                <div className="flex items-center rounded-full border border-navy/15">
                  <button
                    type="button"
                    onClick={() => setQty((value) => Math.max(1, value - 1))}
                    disabled={qty <= 1}
                    className="flex size-10 items-center justify-center rounded-l-full text-navy transition hover:bg-cream/40 disabled:opacity-40"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus className="size-4" aria-hidden />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={maxQty || 1}
                    value={qty}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (Number.isNaN(next)) return;
                      setQty(Math.max(1, Math.min(maxQty || 1, Math.floor(next))));
                    }}
                    className="w-12 border-x border-navy/10 py-2 text-center text-sm font-semibold text-navy focus:outline-none"
                    aria-label="Jumlah pembelian"
                  />
                  <button
                    type="button"
                    onClick={() => setQty((value) => Math.min(maxQty || 1, value + 1))}
                    disabled={qty >= (maxQty || 1)}
                    className="flex size-10 items-center justify-center rounded-r-full text-navy transition hover:bg-cream/40 disabled:opacity-40"
                    aria-label="Tambah jumlah"
                  >
                    <Plus className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="field-label">Subtotal</p>
                <p className="font-display text-2xl text-navy">{formatRupiah(price * qty)}</p>
              </div>
            </div>

            {soldOut && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-terracotta-soft px-3 py-2 text-xs text-terracotta-dark">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                Stok produk ini sedang habis. Hubungi admin untuk informasi ketersediaan berikutnya.
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={handleAdd} disabled={soldOut} className="btn btn-primary flex-1">
                <ShoppingBag className="size-4" aria-hidden /> Tambah ke Keranjang
              </button>
              <a href={waLink} target="_blank" rel="noreferrer noopener" className="btn btn-accent flex-1">
                <MessageCircle className="size-4" aria-hidden /> Pesan via WhatsApp
              </a>
            </div>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
              Pesanan belum dianggap diterima sebelum admin mengonfirmasi ketersediaan stok dan ongkir.
            </p>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Berat / isi", value: product.weight },
              { label: "Kategori", value: category?.name ?? "-" },
              { label: "Stok tersedia", value: `${product.stock} paket` },
              { label: "Penyimpanan", value: "Freezer -18°C" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 rounded-2xl bg-cream-50 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-muted">{row.label}</dt>
                <dd className="text-sm font-semibold text-navy">{row.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-5 space-y-2">
            {[
              "Dikirim dalam kondisi beku dengan kemasan insulasi.",
              "Simpan segera di freezer setelah diterima.",
              "Jangan membekukan ulang produk yang sudah dicairkan.",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm text-charcoal/70">
                <Check className="mt-0.5 size-4 shrink-0 text-olive-dark" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-3xl">Produk terkait</h2>
            <Link to="/produk" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-terracotta-dark">
              <ArrowLeft className="size-4" aria-hidden /> Semua produk
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
