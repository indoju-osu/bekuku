import { Snowflake } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppData } from "@/store/AppDataContext";
import { useImageSrc } from "@/hooks/useImageSrc";

interface BrandProps {
  to?: string;
  className?: string;
  variant?: "light" | "dark";
  showTagline?: boolean;
}

export function Brand({ to = "/", className = "", variant = "dark", showTagline = true }: BrandProps) {
  const { settings } = useAppData();
  const { src } = useImageSrc(settings.logo);
  const isLight = variant === "light";

  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 ${className}`}
      aria-label={`${settings.storeName} — halaman utama`}
    >
      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-navy text-cream shadow-[0_10px_24px_-16px_rgba(15,27,54,0.9)] transition group-hover:bg-navy-soft">
        {src ? (
          <img src={src} alt="" className="size-full object-cover" />
        ) : (
          <Snowflake className="size-6" strokeWidth={1.6} aria-hidden />
        )}
        <span className="absolute -right-1 -top-1 size-3 rounded-full bg-terracotta" aria-hidden />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[1.15rem] font-semibold tracking-tight ${isLight ? "text-offwhite" : "text-navy"}`}
        >
          {settings.storeName}
        </span>
        {showTagline && (
          <span
            className={`mt-1 text-[10px] font-medium uppercase tracking-[0.18em] ${isLight ? "text-cream/80" : "text-olive"}`}
          >
            {settings.tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
