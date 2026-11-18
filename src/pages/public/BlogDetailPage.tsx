import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { useAppData } from "@/store/AppDataContext";
import { formatDate } from "@/lib/format";
import { NotFoundPage } from "@/pages/public/NotFoundPage";

export function BlogDetailPage() {
  const { slug } = useParams();
  const { articles, settings } = useAppData();
  const article = articles.find((item) => item.slug === slug && item.status === "published");

  useEffect(() => {
    if (article) document.title = `${article.title} — ${settings.storeName}`;
    return () => {
      document.title = `${settings.storeName} — Frozen Food Berkualitas, Praktis untuk Setiap Momen`;
    };
  }, [article, settings.storeName]);

  if (!article) return <NotFoundPage title="Artikel tidak ditemukan" />;

  const related = articles
    .filter((item) => item.status === "published" && item.id !== article.id)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 2);

  const paragraphs = article.content.split(/\n{2,}/).filter(Boolean);

  return (
    <article className="container-page py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link to="/" className="hover:text-navy">
          Beranda
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link to="/artikel" className="hover:text-navy">
          Artikel
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="line-clamp-1 text-navy">{article.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-olive">
            <CalendarDays className="size-3.5" aria-hidden /> {formatDate(article.publishedAt)}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl leading-[1.12] sm:text-4xl">{article.title}</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-charcoal/70">{article.excerpt}</p>

          <div className="mt-7 overflow-hidden rounded-4xl border border-navy/8">
            <ProductImage
              image={article.image}
              alt={article.title}
              priority
              sizes="(max-width: 1024px) 92vw, 720px"
              className="aspect-16/9 w-full"
            />
          </div>

          <div className="mt-8 max-w-2xl space-y-5">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-[15px] leading-[1.8] text-charcoal/80">
                {paragraph}
              </p>
            ))}
          </div>

          <Link to="/artikel" className="btn btn-secondary btn-sm mt-9">
            <ArrowLeft className="size-4" aria-hidden /> Kembali ke daftar artikel
          </Link>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl bg-cream-100 p-5">
            <h2 className="font-display text-lg">Belanja kebutuhan Anda</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-charcoal/70">
              Semua produk pada artikel ini tersedia di katalog. Pesan langsung melalui website atau
              WhatsApp.
            </p>
            <Link to="/produk" className="btn btn-primary btn-sm mt-4 w-full">
              Buka katalog
            </Link>
          </div>

          {related.length > 0 && (
            <div className="rounded-3xl border border-navy/8 bg-white p-5">
              <h2 className="font-display text-lg">Artikel lainnya</h2>
              <ul className="mt-3 space-y-3">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link to={`/artikel/${item.slug}`} className="group flex gap-3">
                      <span className="size-14 shrink-0 overflow-hidden rounded-xl">
                        <ProductImage image={item.image} alt="" className="size-full" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium leading-snug text-navy group-hover:text-terracotta-dark">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted">
                          {formatDate(item.publishedAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
