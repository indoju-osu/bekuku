import type { CartItem, Product, StoreSettings } from "@/types";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number): string {
  return rupiah.format(Math.max(0, Math.round(value)));
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function discountedPrice(product: Product): number {
  return product.discountPrice && product.discountPrice < product.price
    ? product.discountPrice
    : product.price;
}

export function hasDiscount(product: Product): boolean {
  return Boolean(product.discountPrice && product.discountPrice < product.price);
}

export function discountPercent(product: Product): number {
  if (!hasDiscount(product)) return 0;
  return Math.round((1 - (product.discountPrice as number) / product.price) * 100);
}

export function stockLabel(stock: number): { label: string; tone: string } {
  if (stock <= 0) return { label: "Stok habis", tone: "text-terracotta-dark bg-terracotta-soft" };
  if (stock <= 10) return { label: `Stok menipis · ${stock}`, tone: "text-olive-dark bg-olive-soft" };
  return { label: `Stok tersedia · ${stock}`, tone: "text-olive-dark bg-olive-soft" };
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.subtotal, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.qty, 0);
}

/** Normalise an Indonesian phone number into the international wa.me format. */
export function normaliseWhatsapp(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const phone = normaliseWhatsapp(number);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

interface OrderMessageInput {
  settings: StoreSettings;
  items: CartItem[];
  total: number;
  customer: { name: string; phone: string; address: string; notes: string };
}

/** Compose a tidy, readable order message for the store's WhatsApp number. */
export function buildOrderMessage({ settings, items, total, customer }: OrderMessageInput): string {
  const lines: string[] = [];
  lines.push(`*PESANAN BARU — ${settings.storeName}*`);
  lines.push("");
  lines.push("*Detail Produk*");
  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.product.name}`);
    lines.push(
      `   ${item.qty} x ${formatRupiah(item.unitPrice)} = ${formatRupiah(item.subtotal)}`,
    );
  });
  lines.push("");
  lines.push(`*Total Belanja:* ${formatRupiah(total)}`);
  lines.push("");
  lines.push("*Data Pengiriman*");
  lines.push(`Nama: ${customer.name}`);
  lines.push(`Telepon: ${customer.phone}`);
  lines.push(`Alamat: ${customer.address}`);
  if (customer.notes.trim()) lines.push(`Catatan: ${customer.notes.trim()}`);
  lines.push("");
  lines.push(
    "Mohon konfirmasi ketersediaan stok dan total pembayaran. Terima kasih.",
  );
  return lines.join("\n");
}

export function truncate(text: string, max = 130): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}

export function uniqueSlug(base: string, existing: string[]): string {
  const root = slugify(base) || "item";
  if (!existing.includes(root)) return root;
  let counter = 2;
  while (existing.includes(`${root}-${counter}`)) counter += 1;
  return `${root}-${counter}`;
}
