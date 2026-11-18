import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Brand } from "@/components/Brand";
import { useCart } from "@/store/CartContext";

const NAV = [
  { to: "/", label: "Beranda", end: true },
  { to: "/produk", label: "Produk", end: false },
  { to: "/tentang", label: "Tentang Kami", end: false },
];

export function Header() {
  const { count } = useCart();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-navy/8 bg-offwhite/92 backdrop-blur-md supports-[backdrop-filter]:bg-offwhite/75"
          : "border-b border-transparent bg-offwhite/60 backdrop-blur-sm"
      }`}
    >
      <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
        <Brand />

        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `link-underline text-sm font-medium transition-colors ${
                  isActive ? "text-navy" : "text-charcoal/70 hover:text-navy"
                }`
              }
            >
              {({ isActive }) => (
                <span data-active={isActive ? "true" : "false"} className="link-underline">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/keranjang" className="relative rounded-full p-2.5 text-navy transition hover:bg-cream/40" aria-label={`Keranjang belanja, ${count} produk`}>
            <ShoppingBag className="size-5" strokeWidth={1.7} aria-hidden />
            <span
              aria-hidden
              className={`absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-5 transition ${
                count > 0 ? "bg-terracotta text-white" : "bg-cream text-navy/60"
              }`}
            >
              {count}
            </span>
          </Link>

          <Link to="/produk" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Belanja Sekarang
          </Link>

          <button
            type="button"
            className="rounded-full p-2.5 text-navy transition hover:bg-cream/40 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Tutup menu" : "Buka menu"}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-navy/8 bg-offwhite transition-[max-height,opacity] duration-300 md:hidden ${
          open ? "max-h-[26rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav aria-label="Navigasi seluler" className="container-page flex flex-col gap-1 py-4">
          {[...NAV, { to: "/artikel", label: "Artikel", end: false }, { to: "/kategori", label: "Kategori", end: false }].map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-3 text-base font-medium transition ${
                    isActive ? "bg-cream-100 text-navy" : "text-charcoal/80 hover:bg-cream/30"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
          <Link to="/keranjang" className="rounded-xl px-3 py-3 text-base font-medium text-charcoal/80 hover:bg-cream/30">
            Keranjang {count > 0 ? `(${count})` : ""}
          </Link>
          <Link to="/produk" className="btn btn-primary mt-2">
            Belanja Sekarang
          </Link>
        </nav>
      </div>
    </header>
  );
}
