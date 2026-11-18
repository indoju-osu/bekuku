import { useEffect, useState } from "react";
import { getImage } from "@/lib/imageStore";
import type { ImageRef } from "@/types";

interface ResolvedImage {
  src: string | null;
  loading: boolean;
}

/**
 * Resolves an ImageRef into a usable `src`.
 *
 * Bundled assets resolve immediately; admin uploads are read from IndexedDB and
 * exposed through an object URL that is revoked on cleanup. The effect is keyed
 * by the ref *value* (not object identity) so inline `{ kind: "asset" }` literals
 * in JSX don't cause a render loop.
 */
export function useImageSrc(ref: ImageRef | undefined): ResolvedImage {
  const key = !ref ? "" : ref.kind === "asset" ? `asset:${ref.path}` : `upload:${ref.id}`;
  const [state, setState] = useState<ResolvedImage>(() => ({
    src: key.startsWith("asset:") ? key.slice(6) : null,
    loading: key.startsWith("upload:"),
  }));

  useEffect(() => {
    if (!key) {
      setState((current) => (current.src === null && !current.loading ? current : { src: null, loading: false }));
      return;
    }

    if (key.startsWith("asset:")) {
      const assetSrc = key.slice(6);
      setState((current) =>
        current.src === assetSrc && !current.loading ? current : { src: assetSrc, loading: false },
      );
      return;
    }

    const id = key.slice(7);
    let active = true;
    let objectUrl: string | null = null;
    setState((current) => ({ src: current.src, loading: true }));

    getImage(id).then((record) => {
      if (!active) return;
      if (!record) {
        setState({ src: null, loading: false });
        return;
      }
      objectUrl = URL.createObjectURL(record.blob);
      setState({ src: objectUrl, loading: false });
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [key]);

  return state;
}
