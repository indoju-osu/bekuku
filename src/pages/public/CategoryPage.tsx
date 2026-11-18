import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useAppData } from "@/store/AppDataContext";

export function CategoryPage() {
  const { categories, products } = useAppData();
  const active = products.filter((product) => product.status === "active");

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        eyebrow="Kategori produk"
        title="Temukan produk berdasarkan kebutuhan"
        description="Delapan kategori utama untuk memudahkan Anda menjelajah katalog. Setiap kategori menampilkan produk yang masih aktif dijual."
      />

      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const items = active.filter((product) => product.categoryId === category.id);
          const cover = items[0]?.image ?? null;
          const priceFrom = items.length
            ? Math.min(...items.map((product) => product.discountPrice ?? product.price))
            : null;
          return (
            <article key={category.id} className="card group overflow-hidden">
              <div className="relative aspect-16/10 overflow-hidden">
                <ProductImage
                  image={cover}
                  alt={`Produk kategori ${category.name}`}
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
                  className="size-full transition duration-500 group-hover:scale-[1.05]"
                />
                <span className="absolute left-3 top-3 chip bg-white/95 text-navy">{items.length} produk</span>
              </div>
              <div className="p-5">
                <h2 className="font-display text-xl">{category.name}</h2>
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-charcoal/65">
                  {category.description}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted">
                    {priceFrom !== null ? `Mulai dari Rp${priceFrom.toLocaleString("id-ID")}` : "Belum ada produk"}
                  </span>
                  <Link
                    to={`/produk?kategori=${category.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-terracotta-dark"
                  >
                    Lihat <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
