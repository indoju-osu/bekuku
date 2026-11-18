import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, FileText } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useAppData } from "@/store/AppDataContext";
import { formatDate } from "@/lib/format";

export function BlogPage() {
  const { articles } = useAppData();
  const published = articles
    .filter((article) => article.status === "published")
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  const [featured, ...rest] = published;

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionHeading
        eyebrow="Microblog"
        title="Informasi, promo, dan tips frozen food"
        description="Catatan dari tim toko: promo terbaru, tips penyimpanan, dan ide mengolah makanan beku untuk keluarga."
      />

      {published.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-navy/15 bg-white/60 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-cream-100 text-olive-dark">
            <FileText className="size-7" aria-hidden />
          </span>
          <h2 className="mt-4 font-display text-xl">Belum ada artikel terbit</h2>
          <p className="mt-2 max-w-sm text-sm text-charcoal/65">
            Artikel yang masih berstatus draf tidak ditampilkan pada halaman publik. Silakan periksa kembali
            nanti.
          </p>
        </div>
      ) : (
        <div className="mt-9 space-y-8">
          {featured && (
            <Reveal>
              <article className="grid overflow-hidden rounded-4xl border border-navy/8 bg-white lg:grid-cols-2">
                <Link
                  to={`/artikel/${featured.slug}`}
                  className="relative aspect-16/10 overflow-hidden lg:aspect-auto lg:h-full"
                >
                  <ProductImage
                    image={featured.image}
                    alt={featured.title}
                    priority
                    sizes="(max-width: 1024px) 92vw, 520px"
                    className="size-full"
                  />
                </Link>
                <div className="flex flex-col justify-center p-6 sm:p-9">
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-olive">
                    <CalendarDays className="size-3.5" aria-hidden /> {formatDate(featured.publishedAt)}
                  </p>
                  <h2 className="mt-3 font-display text-2xl leading-snug sm:text-3xl">
                    <Link to={`/artikel/${featured.slug}`} className="hover:text-terracotta-dark">
                      {featured.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{featured.excerpt}</p>
                  <Link
                    to={`/artikel/${featured.slug}`}
                    className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-navy hover:text-terracotta-dark"
                  >
                    Baca selengkapnya <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </article>
            </Reveal>
          )}

          {rest.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article, index) => (
                <Reveal key={article.id} delay={index * 60}>
                  <article className="card group flex h-full flex-col overflow-hidden">
                    <Link to={`/artikel/${article.slug}`} className="aspect-16/10 overflow-hidden">
                      <ProductImage
                        image={article.image}
                        alt={article.title}
                        sizes="(max-width: 768px) 92vw, 30vw"
                        className="size-full transition duration-500 group-hover:scale-[1.04]"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-olive">
                        {formatDate(article.publishedAt)}
                      </p>
                      <h3 className="mt-2 font-display text-lg leading-snug">
                        <Link to={`/artikel/${article.slug}`} className="hover:text-terracotta-dark">
                          {article.title}
                        </Link>
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-charcoal/65">
                        {article.excerpt}
                      </p>
                      <Link
                        to={`/artikel/${article.slug}`}
                        className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-navy hover:text-terracotta-dark"
                      >
                        Baca selengkapnya <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
