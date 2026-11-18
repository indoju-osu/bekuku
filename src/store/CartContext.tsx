import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAppData } from "@/store/AppDataContext";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import { cartCount, cartSubtotal, discountedPrice } from "@/lib/format";
import type { CartItem, CartLine } from "@/types";

interface CartValue {
  lines: CartLine[];
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (productId: string, qty?: number) => { ok: boolean; message: string };
  setQty: (productId: string, qty: number) => { ok: boolean; message: string };
  removeItem: (productId: string) => void;
  clear: () => void;
  qtyOf: (productId: string) => number;
  storageError: string | null;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useAppData();
  const [lines, setLines] = useState<CartLine[]>(() =>
    readJson<CartLine[]>(STORAGE_KEYS.cart, []).filter(
      (line) => line && typeof line.productId === "string" && Number.isFinite(line.qty),
    ),
  );
  const [storageError, setStorageError] = useState<string | null>(null);

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
    const result = writeJson(STORAGE_KEYS.cart, next);
    setStorageError(result.ok ? null : result.error);
  }, []);

  // Drop lines whose product was deleted, and clamp quantities to live stock.
  useEffect(() => {
    setLines((current) => {
      let changed = false;
      const next = current.flatMap((line) => {
        const product = products.find((item) => item.id === line.productId);
        if (!product || product.status !== "active") {
          changed = true;
          return [];
        }
        const max = Math.max(0, Math.min(product.stock, 99));
        if (line.qty > max) {
          changed = true;
          return max === 0 ? [] : [{ ...line, qty: max }];
        }
        return [line];
      });
      if (!changed) return current;
      writeJson(STORAGE_KEYS.cart, next);
      return next;
    });
  }, [products]);

  const items = useMemo<CartItem[]>(
    () =>
      lines.flatMap((line) => {
        const product = products.find((item) => item.id === line.productId);
        if (!product) return [];
        const unitPrice = discountedPrice(product);
        return [
          {
            productId: line.productId,
            qty: line.qty,
            product,
            unitPrice,
            subtotal: unitPrice * line.qty,
          },
        ];
      }),
    [lines, products],
  );

  const addItem = useCallback(
    (productId: string, qty = 1) => {
      const product = products.find((item) => item.id === productId);
      if (!product) return { ok: false, message: "Produk tidak ditemukan." };
      if (product.status !== "active") return { ok: false, message: "Produk sedang tidak dijual." };
      if (product.stock <= 0) return { ok: false, message: "Stok produk ini sedang habis." };
      const existing = lines.find((line) => line.productId === productId);
      const desired = (existing?.qty ?? 0) + qty;
      if (desired > product.stock) {
        return {
          ok: false,
          message: `Stok tersisa ${product.stock}. Jumlah di keranjang tidak boleh melebihi stok.`,
        };
      }
      const next = existing
        ? lines.map((line) => (line.productId === productId ? { ...line, qty: desired } : line))
        : [...lines, { productId, qty }];
      persist(next);
      return { ok: true, message: `${product.name} ditambahkan ke keranjang.` };
    },
    [lines, persist, products],
  );

  const setQty = useCallback(
    (productId: string, qty: number) => {
      const product = products.find((item) => item.id === productId);
      if (!product) return { ok: false, message: "Produk tidak ditemukan." };
      if (qty <= 0) {
        persist(lines.filter((line) => line.productId !== productId));
        return { ok: true, message: `${product.name} dihapus dari keranjang.` };
      }
      if (qty > product.stock) {
        return { ok: false, message: `Stok tersisa ${product.stock}.` };
      }
      persist(
        lines.map((line) => (line.productId === productId ? { ...line, qty: Math.min(qty, 99) } : line)),
      );
      return { ok: true, message: "Jumlah diperbarui." };
    },
    [lines, persist, products],
  );

  const removeItem = useCallback(
    (productId: string) => {
      persist(lines.filter((line) => line.productId !== productId));
    },
    [lines, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo<CartValue>(
    () => ({
      lines,
      items,
      count: cartCount(items),
      subtotal: cartSubtotal(items),
      addItem,
      setQty,
      removeItem,
      clear,
      qtyOf: (productId: string) => lines.find((line) => line.productId === productId)?.qty ?? 0,
      storageError,
    }),
    [addItem, clear, items, lines, removeItem, setQty, storageError],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart harus dipakai di dalam CartProvider");
  return context;
}
