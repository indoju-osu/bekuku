import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldAlert,
  Tags,
  X,
} from "lucide-react";
import { Brand } from "@/components/Brand";
import { useAppData } from "@/store/AppDataContext";
import { useToast } from "@/store/ToastContext";
import { getSession, signOut } from "@/lib/adminAuth";

const LINKS = [
  { to: "/admin", label: "Ringkasan", icon: LayoutDashboard, end: true },
  { to: "/admin/produk", label: "Produk", icon: Package, end: false },
  { to: "/admin/kategori", label: "Kategori", icon: Tags, end: false },
  { to: "/admin/artikel", label: "Microblog", icon: BookOpen, end: false },
  { to: "/admin/stok", label: "Manajemen Stok", icon: Boxes, end: false },
  { to: "/admin/pengaturan", label: "Pengaturan Toko", icon: Settings, end: false },
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { storageWarning, dismissStorageWarning } = useAppData();
  const session = getSession();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    signOut();
    notify("Anda telah keluar dari dashboard.", "info");
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-cream-50">
      <div className="flex min-h-dvh">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-60 w-72 transform bg-navy px-4 py-6 text-cream transition-transform duration-300 lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Navigasi dashboard"
        >
          <div className="flex items-center justify-between">
            <Brand variant="light" to="/admin" />
            <button
              type="button"
              className="rounded-full p-2 text-cream/80 hover:bg-cream/10 lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Tutup menu"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <nav className="mt-8 space-y-1">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? "bg-cream/15 text-offwhite" : "text-cream/70 hover:bg-cream/10 hover:text-offwhite"
                  }`
                }
              >
                <link.icon className="size-4" aria-hidden />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-cream/15 bg-white/5 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-cream">
              <ShieldAlert className="size-3.5" aria-hidden /> Mode demonstrasi
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-cream/60">
              Login admin/admin dan penyimpanan peramban bukan sistem keamanan produksi. Untuk situs publik,
              gunakan backend autentikasi, hashing password, dan sesi server.
            </p>
          </div>

          <div className="mt-6 space-y-2 border-t border-cream/15 pt-5">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-cream/70 transition hover:bg-cream/10 hover:text-offwhite"
            >
              <ArrowUpRight className="size-3.5" aria-hidden /> Lihat website publik
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-cream/70 transition hover:bg-terracotta/20 hover:text-offwhite"
            >
              <LogOut className="size-3.5" aria-hidden /> Keluar ({session?.username ?? "admin"})
            </button>
          </div>
        </aside>

        {open && (
          <button
            type="button"
            className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Tutup navigasi"
          />
        )}

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-navy/8 bg-cream-50/90 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl border border-navy/12 p-2 text-navy lg:hidden"
                aria-label="Buka menu dashboard"
              >
                <Menu className="size-5" aria-hidden />
              </button>
              <div className="hidden items-center gap-2 text-xs text-muted sm:flex">
                <span className="chip bg-olive-soft text-olive-dark">Dashboard</span>
                <span>Kelola katalog, stok, dan konten toko.</span>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/" className="btn btn-secondary btn-sm">
                  <ArrowUpRight className="size-3.5" aria-hidden /> Website
                </Link>
                <span className="flex size-9 items-center justify-center rounded-full bg-navy font-display text-sm text-cream">
                  A
                </span>
              </div>
            </div>
          </header>

          {storageWarning && (
            <div className="flex items-start gap-3 border-b border-terracotta/20 bg-terracotta-soft px-4 py-3 text-sm text-navy sm:px-6 lg:px-8">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-terracotta-dark" aria-hidden />
              <p className="flex-1">{storageWarning}</p>
              <button
                type="button"
                onClick={dismissStorageWarning}
                className="rounded-full p-1 hover:bg-navy/10"
                aria-label="Tutup peringatan"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          )}

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
