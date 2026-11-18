import { ImageOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useImageSrc } from "@/hooks/useImageSrc";
import type { ImageRef } from "@/types";

interface ProductImageProps {
  image: ImageRef;
  alt: string;
  className?: string;
  /** Above-the-fold images skip lazy loading. */
  priority?: boolean;
  sizes?: string;
}

/**
 * Real product photo with an honest fallback: when a photo is missing or fails
 * to load we show a neutral "photo unavailable" state instead of stock artwork.
 */
export function ProductImage({ image, alt, className = "", priority, sizes }: ProductImageProps) {
  const { src, loading } = useImageSrc(image);
  const [failed, setFailed] = useState(false);
  const showFallback = (!src && !loading) || failed;

  if (showFallback) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-cream-100 text-center text-muted ${className}`}
        role="img"
        aria-label={`${alt} — foto belum tersedia`}
      >
        <ImageOff className="size-6 text-olive" aria-hidden />
        <span className="px-3 text-[11px] font-medium leading-tight">Foto belum tersedia</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-cream-100 ${className}`} aria-hidden>
        <Loader2 className="size-5 animate-spin text-olive" />
      </div>
    );
  }

  return (
    <img
      src={src ?? undefined}
      alt={alt}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
