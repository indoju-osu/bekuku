import { Link } from "react-router-dom";
import { Plus, ShoppingBag } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { useAppData } from "@/store/AppDataContext";
import { useCart } from "@/store/CartContext";
import { useToast } from "@/store/ToastContext";
import { discountedPrice, discountPercent, formatRupiah, hasDiscount, stockLabel } from "@/lib/format";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority }: ProductCardProps) {
  const { categoryById } = useAppData();
  const { addItem } = useCart();
  const { notify } = useToast();
  const category = categoryById(product.categoryId);
  const stock = stockLabel(product.stock);
  const soldOut = product.stock <= 0;

  const handleAdd = () => {
    const result = addItem(product.id, 1);
    notify(result.message, result.ok ? "success" : "error");
  };

  return (
    <article className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-36px_rgba(15,27,54,0.45)]">
      <div className="relative aspect-4/3 overflow-hidden bg-cream-100">
        <Link to={`/produk/${product.slug}`} aria-label={`Lihat detail ${product.name}`} className="block size-full">
          <ProductImage
            image={product.image}
            alt={product.name}
            priority={priority}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="size-full transition duration-500 group-hover:scale-[1.04]"
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap gap-1.5">
          {hasDiscount(product) && (
            <span className="chip bg-terracotta text-white">Promo {discountPercent(product)}%</span>
          )}
          {product.isFeatured && <span className="chip bg-cream-50/95 text-navy">Best Seller</span>}
          {product.isNew && <span className="chip bg-olive text-white">New</span>}
        </div>

        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/45 backdrop-blur-[1px]">
            <span className="rounded-full bg-offwhite px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-navy">
              Stok habis
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-olive">
            {category?.name ?? "Produk"}
          </span>
          <span className={`chip !px-2 !py-0.5 text-[10px] ${stock.tone}`}>{stock.label}</span>
        </div>

        <h3 className="font-display text-lg leading-snug">
          <Link to={`/produk/${product.slug}`} className="hover:text-terracotta-dark">
            {product.name}
          </Link>
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-charcoal/65">{product.description}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl font-semibold text-navy">
                {formatRupiah(discountedPrice(product))}
              </span>
              {hasDiscount(product) && (
                <span className="text-xs text-muted line-through">{formatRupiah(product.price)}</span>
              )}
            </div>
            <span className="text-[11px] text-muted">{product.weight}</span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-offwhite transition hover:bg-terracotta disabled:cursor-not-allowed disabled:bg-cream-200 disabled:text-navy/40"
            aria-label={`Tambah ${product.name} ke keranjang`}
            title={soldOut ? "Stok habis" : "Tambah ke keranjang"}
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>

        <Link
          to={`/produk/${product.slug}`}
          className="btn btn-secondary btn-sm w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="size-4" aria-hidden /> Lihat Detail
          </span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
