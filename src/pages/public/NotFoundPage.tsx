import { Link } from "react-router-dom";
import { ArrowRight, SearchX } from "lucide-react";

export function NotFoundPage({ title = "Halaman tidak ditemukan" }: { title?: string }) {
  return (
    <div className="container-page py-20 sm:py-28">
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-4xl border border-navy/8 bg-white px-6 py-14 text-center shadow-sm">
        <span className="flex size-16 items-center justify-center rounded-full bg-cream-100 text-olive-dark">
          <SearchX className="size-7" aria-hidden />
        </span>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-olive">404</p>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-charcoal/65">
          Tautan yang Anda buka mungkin sudah berubah atau produk telah dihapus dari katalog. Silakan
          kembali ke beranda atau lihat produk lain.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link to="/" className="btn btn-primary">
            Ke beranda
          </Link>
          <Link to="/produk" className="btn btn-secondary">
            Lihat katalog <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
