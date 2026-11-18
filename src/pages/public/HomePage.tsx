import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChefHat,
  Clock3,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { FrostScene } from "@/components/public/FrostScene";
import { ProductCard } from "@/components/public/ProductCard";
import { ProductImage } from "@/components/ui/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useAppData } from "@/store/AppDataContext";
import { seedTestimonials } from "@/data/seed";
import {
  buildWhatsAppUrl,
  discountedPrice,
  formatDate,
  formatRupiah,
  hasDiscount,
} from "@/lib/format";

const assetRef = (path: string) => ({ kind: "asset" as const, path });

export function HomePage() {
  const { products, categories, articles, settings, categoryById } = useAppData();

  const active = products.filter((product) => product.status === "active");
  const bestSellers = [...active]
    .filter((product) => product.isFeatured)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4);
  const promos = active.filter((product) => hasDiscount(product)).slice(0, 3);
  const newest = active.filter((product) => product.isNew).slice(0, 3);
  const publishedArticles = articles
    .filter((article) => article.status === "published")
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 3);

  const heroLinks = {
    dimsum: active.find((product) => product.slug === "dimsum-ayam-udang"),
    nugget: active.find((product) => product.slug === "nugget-ayam-premium"),
    fries: active.find((product) => product.slug === "kentang-goreng-shoestring"),
  };

  const waLink = buildWhatsAppUrl(
    settings.whatsapp,
    `Halo ${settings.storeName}, saya ingin memesan frozen food. Mohon informasi stok dan pengiriman.`,
  );

  const totalStock = active.reduce((sum, product) => sum + product.stock, 0);

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <FrostScene />
        <div className="container-page relative grid gap-12 pb-16 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:pb-24 lg:pt-16">
          <div className="max-w-xl">
            <Reveal>
              <span className="chip border border-navy/10 bg-white/80 text-navy backdrop-blur">
                <Snowflake className="size-3.5 text-olive" aria-hidden />
                Toko frozen food · Jakarta Selatan
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 font-display text-[2.6rem] leading-[1.06] tracking-tight text-navy sm:text-5xl lg:text-[3.4rem]">
                Frozen Food Berkualitas,{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">Praktis</span>
                  <svg
                    viewBox="0 0 200 14"
                    className="absolute inset-x-0 bottom-1 z-0 h-2.5 w-full text-terracotta/45"
                    aria-hidden
                    preserveAspectRatio="none"
                  >
                    <path d="M2 9C40 3 90 2 140 5c20 1 40 3 58 4" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                untuk Setiap Momen.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-charcoal/75">
                Temukan berbagai pilihan makanan beku berkualitas untuk menemani kebutuhan keluarga Anda.
                Praktis disajikan, lezat dinikmati, dan mudah dipesan dari rumah.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/produk" className="btn btn-primary">
                  Belanja Sekarang <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link to="/produk" className="btn btn-secondary">
                  Lihat Katalog
                </Link>
              </div>
            </Reveal>
            <Reveal delay={280}>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-navy/10 pt-6">
                {[
                  { value: `${active.length}`, label: "Produk pilihan" },
                  { value: `${categories.length}`, label: "Kategori" },
                  { value: `${totalStock}`, label: "Paket siap kirim" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span className="block font-display text-2xl text-navy">{stat.value}</span>
                      <span className="mt-0.5 block text-[11px] uppercase tracking-[0.12em] text-muted">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={140} className="relative">
            <div className="relative mx-auto grid max-w-lg grid-cols-5 grid-rows-6 gap-3 sm:gap-4">
              <div className="col-span-3 row-span-4 overflow-hidden rounded-4xl border border-white/70 shadow-[0_30px_70px_-40px_rgba(15,27,54,0.6)]">
                <ProductImage
                  image={heroLinks.dimsum?.image ?? assetRef("/images/products/dimsum-ayam-udang.webp")}
                  alt="Dimsum ayam udang kukus di atas piring saji"
                  priority
                  sizes="(max-width: 1024px) 60vw, 320px"
                  className="size-full min-h-56"
                />
              </div>
              <div className="col-span-2 row-span-3 overflow-hidden rounded-3xl border border-white/70 shadow-[0_24px_60px_-40px_rgba(15,27,54,0.55)]">
                <ProductImage
                  image={heroLinks.nugget?.image ?? assetRef("/images/products/nugget-ayam-premium.webp")}
                  alt="Nugget ayam premium yang renyah"
                  priority
                  sizes="(max-width: 1024px) 40vw, 220px"
                  className="size-full min-h-40"
                />
              </div>
              <div className="col-span-2 row-span-3 overflow-hidden rounded-3xl border border-white/70 bg-navy p-4 text-offwhite shadow-[0_24px_60px_-40px_rgba(15,27,54,0.55)]">
                <Snowflake className="size-6 text-cream" aria-hidden />
                <p className="mt-3 font-display text-lg leading-tight">Tetap beku hingga tiba</p>
                <p className="mt-1.5 text-xs leading-relaxed text-cream/75">
                  Kemasan rapat, dikirim dengan armada berpendingin.
                </p>
              </div>
              <div className="col-span-5 row-span-2 overflow-hidden rounded-3xl border border-white/70 shadow-[0_24px_60px_-40px_rgba(15,27,54,0.55)]">
                <ProductImage
                  image={heroLinks.fries?.image ?? assetRef("/images/products/kentang-goreng-shoestring.webp")}
                  alt="Kentang goreng renyah siap disajikan"
                  priority
                  sizes="(max-width: 1024px) 80vw, 420px"
                  className="h-28 w-full sm:h-32"
                />
              </div>
            </div>

            <div className="absolute -bottom-2 left-0 hidden w-52 rounded-2xl border border-navy/8 bg-white/95 p-3.5 shadow-lg backdrop-blur sm:block">
              <div className="flex items-center gap-1 text-terracotta">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-3.5 fill-current" aria-hidden />
                ))}
              </div>
              <p className="mt-2 text-xs leading-snug text-charcoal/75">
                “Dimsumnya jadi favorit keluarga.” — <span className="font-semibold text-navy">Rani P.</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section aria-label="Keunggulan layanan" className="border-y border-navy/8 bg-white">
        <div className="container-page grid gap-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Produk berkualitas", text: "Dipilih dari pemasok terpercaya" },
            { icon: Snowflake, title: "Rantai beku terjaga", text: "Disimpan pada suhu -18°C" },
            { icon: Truck, title: "Pengiriman berpendingin", text: "Area Jakarta & sekitarnya" },
            { icon: MessageCircle, title: "Pesan via WhatsApp", text: "Konfirmasi langsung dari admin" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream-100 text-olive-dark">
                <item.icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">{item.title}</p>
                <p className="text-xs text-muted">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Paling dicari"
          title="Best seller minggu ini"
          description="Produk yang paling sering dipesan pelanggan, siap menemani menu harian keluarga."
          action={
            <Link to="/produk" className="btn btn-secondary btn-sm">
              Lihat semua produk <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
        {bestSellers.length > 0 ? (
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <ProductCard product={product} priority={index < 2} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-navy/15 p-8 text-center text-sm text-muted">
            Belum ada produk unggulan. Tambahkan produk melalui dashboard admin.
          </p>
        )}
      </section>

      {/* BENTO CATEGORIES */}
      <section className="bg-cream-50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Jelajahi kategori"
            title="Semua kebutuhan beku, dalam satu tempat"
            description="Dari lauk sarapan sampai camilan malam — pilih kategori yang Anda butuhkan."
            action={
              <Link to="/kategori" className="btn btn-secondary btn-sm">
                Semua kategori <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          />

          <div className="mt-9 grid auto-rows-[minmax(9.5rem,auto)] grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((category, index) => {
              const count = active.filter((product) => product.categoryId === category.id).length;
              const cover = active.find((product) => product.categoryId === category.id)?.image ?? null;
              const big = index === 0 || index === 5;
              return (
                <Link
                  key={category.id}
                  to={`/produk?kategori=${category.slug}`}
                  className={`group relative overflow-hidden rounded-3xl border border-navy/8 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                    big ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <ProductImage
                    image={cover}
                    alt={`Kategori ${category.name}`}
                    sizes={big ? "(max-width: 640px) 90vw, 40vw" : "(max-width: 640px) 45vw, 22vw"}
                    className={`size-full ${big ? "absolute inset-0" : "absolute inset-0"} transition duration-500 group-hover:scale-105`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/25 to-navy/0" aria-hidden />
                  <div className={`relative flex h-full flex-col justify-end p-4 ${big ? "min-h-52" : "min-h-38"}`}>
                    <p className={`font-display text-offwhite ${big ? "text-2xl" : "text-lg"}`}>{category.name}</p>
                    <p className="mt-1 text-xs text-cream/85">
                      {count} produk {big ? "· " : ""}
                      {big && <span className="line-clamp-2">{category.description}</span>}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROMO */}
      {promos.length > 0 && (
        <section className="container-page py-16 sm:py-20">
          <div className="overflow-hidden rounded-4xl bg-navy text-offwhite">
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-terracotta">
                  <Sparkles className="size-4" aria-hidden /> Promo berjalan
                </p>
                <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                  Harga spesial untuk stok bulan ini
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/75">
                  Diskon sudah terpasang otomatis di katalog — tidak perlu kode tambahan. Selama stok masih
                  tersedia, dan berlaku untuk pesanan melalui website maupun WhatsApp.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/produk?promo=1" className="btn btn-accent">
                    Lihat produk promo
                  </Link>
                  <a href={waLink} target="_blank" rel="noreferrer noopener" className="btn btn-secondary !border-cream/40 !text-offwhite hover:!bg-cream/10">
                    Tanya stok
                  </a>
                </div>
              </div>
              <div className="grid gap-3">
                {promos.map((product) => {
                  const category = categoryById(product.categoryId);
                  return (
                    <Link
                      key={product.id}
                      to={`/produk/${product.slug}`}
                      className="group flex items-center gap-4 rounded-2xl border border-cream/15 bg-white/5 p-3 transition hover:border-cream/40 hover:bg-white/10"
                    >
                      <div className="size-16 shrink-0 overflow-hidden rounded-xl">
                        <ProductImage image={product.image} alt={product.name} className="size-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-offwhite">{product.name}</p>
                        <p className="text-xs text-cream/65">
                          {category?.name} · {product.weight}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-cream">{formatRupiah(discountedPrice(product))}</p>
                        <p className="text-[11px] text-cream/50 line-through">{formatRupiah(product.price)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          align="center"
          eyebrow="Kenapa belanja di sini"
          title="Kualitas yang bisa Anda andalkan"
          description="Tiga alasan pelanggan menjadikan Toko Frozen Food pilihan utama untuk kebutuhan beku keluarga."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: PackageCheck,
              title: "Produk Berkualitas",
              text: "Menyediakan beragam pilihan frozen food berkualitas dengan bahan baku pilihan dan kemasan yang menjaga kesegaran.",
            },
            {
              icon: Clock3,
              title: "Praktis dan Mudah",
              text: "Produk mudah disiapkan untuk berbagai kebutuhan — tinggal goreng, kukus, atau panaskan dalam hitungan menit.",
            },
            {
              icon: MessageCircle,
              title: "Pemesanan Mudah",
              text: "Pemesanan dapat dilakukan melalui website dan WhatsApp, dengan konfirmasi langsung dari tim kami.",
            },
          ].map((feature, index) => (
            <Reveal key={feature.title} delay={index * 80}>
              <div className="card h-full p-7">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-cream-100 text-navy">
                  <feature.icon className="size-6" strokeWidth={1.6} aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-xl">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{feature.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ABOUT + NEW ARRIVALS */}
      <section className="bg-cream-50 py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal className="relative">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 overflow-hidden rounded-4xl">
                <ProductImage
                  image={assetRef("/images/editorial/toko-frozen-food.webp")}
                  alt="Penataan produk frozen food di rak toko"
                  sizes="(max-width: 1024px) 90vw, 440px"
                  className="h-52 w-full sm:h-64"
                />
              </div>
              <div className="overflow-hidden rounded-3xl">
                <ProductImage
                  image={assetRef("/images/products/bakso-sapi-urat.webp")}
                  alt="Bakso sapi urat siap dimasak"
                  className="h-36 w-full"
                />
              </div>
              <div className="overflow-hidden rounded-3xl">
                <ProductImage
                  image={assetRef("/images/products/tempura-udang.webp")}
                  alt="Tempura udang renyah"
                  className="h-36 w-full"
                />
              </div>
            </div>
          </Reveal>
          <div>
            <SectionHeading
              eyebrow="Tentang kami"
              title="Toko tetangga yang menjaga kualitas beku"
              description={settings.description}
            />
            <ul className="mt-6 space-y-3">
              {[
                "Produk disimpan dan dikirim dalam kondisi beku stabil.",
                "Kemasan rapat, higienis, dan diberi label tanggal produksi.",
                "Admin membantu memilih produk sesuai kebutuhan keluarga.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-charcoal/80">
                  <Snowflake className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/tentang" className="btn btn-primary">
                Selengkapnya tentang kami
              </Link>
              <a href={waLink} target="_blank" rel="noreferrer noopener" className="btn btn-secondary">
                <MessageCircle className="size-4" aria-hidden /> Chat admin
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {newest.length > 0 && (
        <section className="container-page py-16 sm:py-20">
          <SectionHeading
            eyebrow="Baru datang"
            title="Produk terbaru di etalase"
            description="Stok baru yang baru saja masuk — coba sebelum kehabisan."
            action={
              <Link to="/produk?urutkan=terbaru" className="btn btn-secondary btn-sm">
                Lihat semua <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          />
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {newest.map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="bg-navy py-16 text-offwhite sm:py-20">
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-terracotta">
                <span className="h-px w-6 bg-terracotta/60" aria-hidden /> Kata pelanggan
              </p>
              <h2 className="font-display text-3xl leading-tight text-offwhite sm:text-4xl">
                Cerita dari dapur pelanggan
              </h2>
            </div>
            <p className="rounded-full border border-cream/20 px-4 py-2 text-[11px] leading-relaxed text-cream/60">
              Konten demonstrasi — bukan ulasan pelanggan terverifikasi.
            </p>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {seedTestimonials.map((testimonial, index) => (
              <Reveal key={testimonial.id} delay={index * 70}>
                <figure className="flex h-full flex-col rounded-3xl border border-cream/15 bg-white/5 p-6">
                  <div className="flex items-center gap-1 text-terracotta">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star
                        key={star}
                        className={`size-4 ${star < testimonial.rating ? "fill-current" : "opacity-25"}`}
                        aria-hidden
                      />
                    ))}
                    <span className="sr-only">{testimonial.rating} dari 5 bintang</span>
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-cream/85">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-cream/15 pt-4">
                    <span className="flex size-10 items-center justify-center rounded-full bg-cream/15 font-display text-sm text-cream">
                      {testimonial.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-offwhite">{testimonial.name}</span>
                      <span className="block text-[11px] text-cream/60">{testimonial.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MICROBLOG */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Microblog"
          title="Informasi & tips terbaru"
          description="Promo, tips penyimpanan, dan ide mengolah frozen food dari tim kami."
          action={
            <Link to="/artikel" className="btn btn-secondary btn-sm">
              Semua artikel <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
        {publishedArticles.length > 0 ? (
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {publishedArticles.map((article, index) => (
              <Reveal key={article.id} delay={index * 60}>
                <article className="card group h-full overflow-hidden">
                  <Link to={`/artikel/${article.slug}`} className="block aspect-16/10 overflow-hidden">
                    <ProductImage
                      image={article.image}
                      alt={article.title}
                      sizes="(max-width: 768px) 90vw, 30vw"
                      className="size-full transition duration-500 group-hover:scale-[1.04]"
                    />
                  </Link>
                  <div className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-olive">
                      {formatDate(article.publishedAt)}
                    </p>
                    <h3 className="mt-2 font-display text-lg leading-snug">
                      <Link to={`/artikel/${article.slug}`} className="hover:text-terracotta-dark">
                        {article.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-charcoal/65">{article.excerpt}</p>
                    <Link
                      to={`/artikel/${article.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-terracotta-dark"
                    >
                      Baca selengkapnya <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-navy/15 p-8 text-center text-sm text-muted">
            Belum ada artikel yang dipublikasikan.
          </p>
        )}
      </section>

      {/* CTA */}
      <section className="container-page pb-4">
        <div className="relative overflow-hidden rounded-4xl bg-cream-100 p-8 sm:p-12">
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-olive-dark">
                <ChefHat className="size-4" aria-hidden /> Siap masak hari ini?
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                Pesan sekarang, kami konfirmasi lewat WhatsApp.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-charcoal/70">
                {settings.shippingNote}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link to="/produk" className="btn btn-primary">
                Mulai belanja
              </Link>
              <a href={waLink} target="_blank" rel="noreferrer noopener" className="btn btn-accent">
                <MessageCircle className="size-4" aria-hidden /> WhatsApp
              </a>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border border-olive/20" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 right-24 size-72 rounded-full border border-terracotta/20" aria-hidden />
        </div>
      </section>
    </div>
  );
}
