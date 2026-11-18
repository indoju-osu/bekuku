import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { useAppData } from "@/store/AppDataContext";

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export function PublicLayout() {
  const { storageWarning, dismissStorageWarning } = useAppData();

  return (
    <div className="flex min-h-dvh flex-col bg-offwhite">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:text-offwhite"
      >
        Lewati ke konten utama
      </a>
      {storageWarning && (
        <div className="bg-terracotta-soft text-navy">
          <div className="container-page flex items-start gap-3 py-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-terracotta-dark" aria-hidden />
            <p className="flex-1">{storageWarning}</p>
            <button
              type="button"
              onClick={dismissStorageWarning}
              className="rounded-full p-1 hover:bg-navy/10"
              aria-label="Tutup peringatan penyimpanan"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
      <Header />
      <main id="konten-utama" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
