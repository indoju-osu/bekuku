import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useImageSrc } from "@/hooks/useImageSrc";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, saveImage, validateImageFile } from "@/lib/imageStore";
import type { ImageRef } from "@/types";

interface ImageUploaderProps {
  value: ImageRef;
  onChange: (next: ImageRef) => void;
  label?: string;
  hint?: string;
  aspect?: "square" | "wide";
}

/**
 * Product/article photo picker. Files are validated and written to IndexedDB so
 * large images never touch localStorage. The preview reads through the same
 * resolver the public pages use.
 */
export function ImageUploader({
  value,
  onChange,
  label = "Foto",
  hint = "JPG, PNG, WebP atau AVIF · maksimal 4 MB",
  aspect = "wide",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { src, loading } = useImageSrc(value);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const record = await saveImage(file);
      onChange({ kind: "upload", id: record.id });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Gagal menyimpan gambar.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <p className="field-label">{label}</p>
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-navy/20 bg-cream-50 ${
          aspect === "wide" ? "aspect-16/9" : "aspect-square max-w-48"
        }`}
      >
        {src ? (
          <>
            <img src={src} alt="Pratinjau foto" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-x-2 bottom-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="btn btn-sm bg-white/95 !text-navy shadow-sm"
              >
                <UploadCloud className="size-3.5" aria-hidden /> Ganti
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="btn btn-sm bg-white/95 !text-terracotta-dark shadow-sm"
                aria-label="Hapus foto"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-2 p-6 text-center text-muted transition hover:text-navy"
            disabled={busy || loading}
          >
            {busy || loading ? (
              <Loader2 className="size-6 animate-spin text-olive" aria-hidden />
            ) : (
              <ImagePlus className="size-7 text-olive" aria-hidden />
            )}
            <span className="text-xs font-medium">
              {busy ? "Menyimpan foto…" : "Klik untuk unggah foto nyata"}
            </span>
            <span className="text-[11px] leading-relaxed">{hint}</span>
          </button>
        )}
        {busy && src && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="size-6 animate-spin text-olive" aria-hidden />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {error && <p className="mt-1.5 text-xs text-terracotta-dark">{error}</p>}
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        Gunakan foto produk asli. Batas {Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB, tersimpan
        permanen di IndexedDB peramban ini.
      </p>
    </div>
  );
}
