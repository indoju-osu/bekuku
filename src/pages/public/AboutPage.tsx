import { Link } from "react-router-dom";
import { Clock, Compass, HeartHandshake, Leaf, MapPin, MessageCircle, ShieldCheck, Target } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useAppData } from "@/store/AppDataContext";
import { buildWhatsAppUrl, normaliseWhatsapp } from "@/lib/format";

export function AboutPage() {
  const { settings, products, categories } = useAppData();
  const waLink = buildWhatsAppUrl(
    settings.whatsapp,
    `Halo ${settings.storeName}, saya ingin bertanya tentang produk dan pengiriman.`,
  );

  return (
    <div>
      <section className="relative overflow-hidden border-b border-navy/8 bg-cream-50">
        <div className="container-page grid gap-10 py-14 sm:py-18 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-olive">
              <span className="h-px w-6 bg-olive/60" aria-hidden /> Tentang kami
            </p>
            <h1 className="mt-4 max-w-xl font-display text-4xl leading-[1.08] sm:text-5xl">
              Menyediakan makanan beku yang praktis, tanpa mengorbankan kualitas.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-charcoal/75">
              {settings.storeName} berawal dari dapur rumahan yang sering menyiapkan menu cepat untuk
              keluarga. Kami memahami bahwa makanan praktis tetap harus enak, aman, dan terjangkau. Karena
              itu kami memilih produk frozen food dari pemasok terpercaya, menyimpannya pada suhu beku yang
              stabil, dan mengantarkannya dengan kemasan yang menjaga kualitas.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/produk" className="btn btn-primary">
                Lihat katalog
              </Link>
              <a href={waLink} target="_blank" rel="noreferrer noopener" className="btn btn-secondary">
                <MessageCircle className="size-4" aria-hidden /> Hubungi kami
              </a>
            </div>
            <dl className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-navy/10 pt-6">
              {[
                { value: `${products.filter((p) => p.status === "active").length}+`, label: "Produk pilihan" },
                { value: `${categories.length}`, label: "Kategori produk" },
                { value: "2019", label: "Melayani sejak" },
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 overflow-hidden rounded-4xl">
              <ProductImage
                image={{ kind: "asset", path: "/images/editorial/toko-frozen-food.webp" }}
                alt="Penataan produk frozen food di rak toko"
                priority
                sizes="(max-width: 1024px) 92vw, 460px"
                className="h-52 w-full sm:h-64"
              />
            </div>
            <div className="overflow-hidden rounded-3xl">
              <ProductImage
                image={{ kind: "asset", path: "/images/products/dimsum-ayam-udang.webp" }}
                alt="Dimsum ayam udang"
                className="h-32 w-full sm:h-40"
              />
            </div>
            <div className="overflow-hidden rounded-3xl">
              <ProductImage
                image={{ kind: "asset", path: "/images/products/sosis-sapi-premium.webp" }}
                alt="Sosis sapi premium"
                className="h-32 w-full sm:h-40"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading
          align="center"
          eyebrow="Visi & misi"
          title="Arah yang kami pegang"
          description="Kami ingin menjadi toko frozen food langganan keluarga di lingkungan kami — dengan pelayanan yang jujur dan produk yang konsisten."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Reveal>
            <div className="card h-full p-7">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-cream-100 text-navy">
                <Compass className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-xl">Visi</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                Menjadi pilihan utama keluarga dalam memenuhi kebutuhan makanan beku yang praktis,
                berkualitas, dan mudah dijangkau.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="card h-full p-7">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-cream-100 text-navy">
                <Target className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-xl">Misi</h3>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-charcoal/70">
                <li>Menyediakan produk frozen food yang jelas asal-usul dan kualitasnya.</li>
                <li>Menjaga rantai beku dari penyimpanan hingga pengiriman.</li>
                <li>Memberikan pelayanan cepat dan ramah melalui website dan WhatsApp.</li>
                <li>Menawarkan harga yang wajar untuk kebutuhan rumah tangga maupun usaha.</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream-50 py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Komitmen kami"
            title="Standar yang kami jaga setiap hari"
            description="Kualitas bukan sekadar klaim. Berikut hal-hal yang kami periksa sebelum produk sampai ke tangan Anda."
          />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Higienis & aman",
                text: "Produk disimpan dalam kemasan tertutup dan dijauhkan dari kontaminasi.",
              },
              {
                icon: Leaf,
                title: "Bahan pilihan",
                text: "Bekerja sama dengan pemasok yang menjaga mutu bahan baku.",
              },
              {
                icon: Clock,
                title: "Rantai beku stabil",
                text: "Freezer dan armada pengiriman dipantau agar suhu tetap -18°C.",
              },
              {
                icon: HeartHandshake,
                title: "Pelayanan ramah",
                text: "Admin membantu memilih produk dan menjawab pertanyaan dengan cepat.",
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 60}>
                <div className="h-full rounded-3xl border border-navy/8 bg-white p-6">
                  <item.icon className="size-6 text-terracotta" aria-hidden />
                  <h3 className="mt-4 font-display text-lg">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-charcoal/70">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-6 rounded-4xl border border-navy/8 bg-white p-6 sm:p-9 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl">Kunjungi atau hubungi toko kami</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-charcoal/70">
              Ingin melihat produk langsung? Silakan datang ke toko, atau tanyakan ketersediaan stok
              melalui WhatsApp sebelum berkunjung.
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex gap-3">
                <dt className="sr-only">Alamat</dt>
                <MapPin className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
                <dd className="text-charcoal/80">{settings.address}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="sr-only">Jam operasional</dt>
                <Clock className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
                <dd className="whitespace-pre-line text-charcoal/80">{settings.hours}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="sr-only">WhatsApp</dt>
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
                <dd className="text-charcoal/80">+{normaliseWhatsapp(settings.whatsapp)}</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col gap-3">
            <a href={waLink} target="_blank" rel="noreferrer noopener" className="btn btn-accent">
              <MessageCircle className="size-4" aria-hidden /> Chat via WhatsApp
            </a>
            <Link to="/produk" className="btn btn-primary">
              Mulai belanja
            </Link>
            <p className="rounded-2xl bg-cream-50 px-4 py-3 text-[11px] leading-relaxed text-muted">
              {settings.shippingNote}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
