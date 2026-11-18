import { Link } from "react-router-dom";
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Brand } from "@/components/Brand";
import { useAppData } from "@/store/AppDataContext";
import { buildWhatsAppUrl, normaliseWhatsapp } from "@/lib/format";

export function Footer() {
  const { settings, categories } = useAppData();
  const waLink = buildWhatsAppUrl(
    settings.whatsapp,
    `Halo ${settings.storeName}, saya ingin bertanya tentang produk frozen food.`,
  );

  return (
    <footer className="mt-24 bg-navy text-cream/80">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Brand variant="light" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">{settings.description}</p>
          <div className="mt-6 flex gap-3">
            <a
              href={settings.instagram}
              target="_blank"
              rel="noreferrer noopener"
              className="flex size-10 items-center justify-center rounded-full border border-cream/25 text-cream transition hover:border-cream hover:bg-cream/10"
              aria-label="Instagram toko"
            >
              <Instagram className="size-4" aria-hidden />
            </a>
            <a
              href={settings.facebook}
              target="_blank"
              rel="noreferrer noopener"
              className="flex size-10 items-center justify-center rounded-full border border-cream/25 text-cream transition hover:border-cream hover:bg-cream/10"
              aria-label="Facebook toko"
            >
              <Facebook className="size-4" aria-hidden />
            </a>
            <a
              href={settings.tiktok}
              target="_blank"
              rel="noreferrer noopener"
              className="flex size-10 items-center justify-center rounded-full border border-cream/25 text-cream transition hover:border-cream hover:bg-cream/10"
              aria-label="TikTok toko"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                <path d="M16.5 3h-2.6v11.2a2.4 2.4 0 1 1-1.9-2.35V9.2a5.1 5.1 0 1 0 4.5 5.05V8.7a6.3 6.3 0 0 0 3.5 1.1V7.2a3.6 3.6 0 0 1-3.5-3.4V3Z" />
              </svg>
            </a>
          </div>
        </div>

        <nav aria-label="Navigasi footer">
          <h2 className="font-display text-lg text-offwhite">Navigasi</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { to: "/", label: "Beranda" },
              { to: "/produk", label: "Katalog Produk" },
              { to: "/kategori", label: "Kategori" },
              { to: "/tentang", label: "Tentang Kami" },
              { to: "/artikel", label: "Artikel" },
              { to: "/keranjang", label: "Keranjang" },
            ].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="link-underline transition hover:text-offwhite">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Kategori footer">
          <h2 className="font-display text-lg text-offwhite">Kategori</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link
                  to={`/produk?kategori=${category.slug}`}
                  className="link-underline transition hover:text-offwhite"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-lg text-offwhite">Hubungi Kami</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
              <span className="leading-relaxed">{settings.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
              <a href={waLink} target="_blank" rel="noreferrer noopener" className="hover:text-offwhite">
                +{normaliseWhatsapp(settings.whatsapp)}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
              <a href={`mailto:${settings.email}`} className="hover:text-offwhite">
                {settings.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-terracotta" aria-hidden />
              <span className="whitespace-pre-line leading-relaxed">{settings.hours}</span>
            </li>
          </ul>
          <a href={waLink} target="_blank" rel="noreferrer noopener" className="btn btn-accent btn-sm mt-5">
            <MessageCircle className="size-4" aria-hidden /> Chat WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <span>Demo katalog · data tersimpan lokal di peramban</span>
            <Link to="/admin/login" className="link-underline hover:text-offwhite">
              Login Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
