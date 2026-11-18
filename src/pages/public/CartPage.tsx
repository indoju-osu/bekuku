import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppData } from "@/store/AppDataContext";
import { useCart } from "@/store/CartContext";
import { useToast } from "@/store/ToastContext";
import { buildOrderMessage, buildWhatsAppUrl, formatRupiah, stockLabel } from "@/lib/format";
import type { CheckoutCustomer } from "@/types";

const emptyCustomer: CheckoutCustomer = { name: "", phone: "", address: "", notes: "" };

type Errors = Partial<Record<keyof CheckoutCustomer, string>>;

function validateCustomer(customer: CheckoutCustomer): Errors {
  const errors: Errors = {};
  if (customer.name.trim().length < 3) errors.name = "Nama minimal 3 karakter.";
  if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(customer.phone.replace(/[\s-]/g, ""))) {
    errors.phone = "Masukkan nomor WhatsApp aktif, contoh 081234567890.";
  }
  if (customer.address.trim().length < 10) {
    errors.address = "Alamat pengiriman minimal 10 karakter.";
  }
  return errors;
}

export function CartPage() {
  const { items, count, subtotal, setQty, removeItem, clear } = useCart();
  const { settings } = useAppData();
  const { notify } = useToast();
  const [customer, setCustomer] = useState<CheckoutCustomer>(emptyCustomer);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmClear, setConfirmClear] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);

  const updateField = (key: keyof CheckoutCustomer, value: string) => {
    setCustomer((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
    setCheckoutDone(false);
  };

  const handleCheckout = (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      notify("Keranjang masih kosong.", "error");
      return;
    }
    const nextErrors = validateCustomer(customer);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      notify("Periksa kembali data pengiriman Anda.", "error");
      return;
    }
    const message = buildOrderMessage({ settings, items, total: subtotal, customer });
    const url = buildWhatsAppUrl(settings.whatsapp, message);
    window.open(url, "_blank", "noopener,noreferrer");
    setCheckoutDone(true);
    notify("WhatsApp dibuka dengan rincian pesanan. Tunggu konfirmasi admin.", "success");
  };

  const handleQty = (productId: string, next: number) => {
    const result = setQty(productId, next);
    if (!result.ok) notify(result.message, "error");
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-16 sm:py-24">
        <div className="mx-auto flex max-w-lg flex-col items-center rounded-4xl border border-navy/8 bg-white px-6 py-14 text-center shadow-sm">
          <span className="flex size-16 items-center justify-center rounded-full bg-cream-100 text-olive-dark">
            <ShoppingBag className="size-7" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-2xl sm:text-3xl">Keranjang belanja masih kosong</h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-charcoal/65">
            Yuk pilih nugget, dimsum, atau kentang goreng favorit keluarga. Semua produk bisa langsung
            dipesan lewat WhatsApp setelah masuk keranjang.
          </p>
          <Link to="/produk" className="btn btn-primary mt-6">
            Lihat katalog produk <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-olive">
            <span className="h-px w-6 bg-olive/60" aria-hidden /> Keranjang
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">Keranjang belanja Anda</h1>
          <p className="mt-1 text-sm text-charcoal/65">
            {count} produk siap dipesan. Periksa jumlah sebelum melanjutkan ke WhatsApp.
          </p>
        </div>
        <button type="button" onClick={() => setConfirmClear(true)} className="btn btn-ghost btn-sm">
          <Trash2 className="size-4" aria-hidden /> Kosongkan keranjang
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
        <section aria-label="Daftar produk di keranjang" className="space-y-3">
          {items.map((item) => {
            const stock = stockLabel(item.product.stock);
            return (
              <article key={item.productId} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <Link
                  to={`/produk/${item.product.slug}`}
                  className="h-24 w-full shrink-0 overflow-hidden rounded-2xl sm:size-24"
                >
                  <ProductImage image={item.product.image} alt={item.product.name} className="size-full" />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/produk/${item.product.slug}`}
                        className="font-display text-lg leading-snug text-navy hover:text-terracotta-dark"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {item.product.weight} · {formatRupiah(item.unitPrice)} / paket
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.productId);
                        notify(`${item.product.name} dihapus dari keranjang.`, "info");
                      }}
                      className="rounded-full p-2 text-muted transition hover:bg-terracotta-soft hover:text-terracotta-dark"
                      aria-label={`Hapus ${item.product.name} dari keranjang`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center rounded-full border border-navy/15 bg-white">
                      <button
                        type="button"
                        onClick={() => handleQty(item.productId, item.qty - 1)}
                        className="flex size-9 items-center justify-center rounded-l-full text-navy transition hover:bg-cream/40"
                        aria-label={`Kurangi jumlah ${item.product.name}`}
                      >
                        <Minus className="size-3.5" aria-hidden />
                      </button>
                      <span className="min-w-9 text-center text-sm font-semibold text-navy">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => handleQty(item.productId, item.qty + 1)}
                        disabled={item.qty >= item.product.stock}
                        className="flex size-9 items-center justify-center rounded-r-full text-navy transition hover:bg-cream/40 disabled:opacity-40"
                        aria-label={`Tambah jumlah ${item.product.name}`}
                      >
                        <Plus className="size-3.5" aria-hidden />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted">Subtotal</p>
                      <p className="font-display text-lg text-navy">{formatRupiah(item.subtotal)}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-muted">
                    <span className={`chip !px-2 !py-0.5 text-[10px] ${stock.tone}`}>{stock.label}</span>
                    <span className="ml-2">Maksimal pembelian sesuai stok tersedia.</span>
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <div className="space-y-4 lg:sticky lg:top-24">
          <section className="card p-5" aria-label="Ringkasan belanja">
            <h2 className="font-display text-xl">Ringkasan pesanan</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal/70">Jumlah produk</dt>
                <dd className="font-medium text-navy">{count} paket</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/70">Subtotal</dt>
                <dd className="font-medium text-navy">{formatRupiah(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/70">Ongkos kirim</dt>
                <dd className="text-xs text-muted">Dikonfirmasi admin</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-navy/10 pt-4">
              <span className="text-sm font-semibold text-navy">Total belanja</span>
              <span className="font-display text-2xl text-navy">{formatRupiah(subtotal)}</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Total belum termasuk ongkir. Admin akan mengonfirmasi biaya kirim dan ketersediaan stok.
            </p>
          </section>

          <form onSubmit={handleCheckout} className="card p-5" noValidate>
            <h2 className="font-display text-xl">Data pengiriman</h2>
            <p className="mt-1 text-xs text-muted">Data ini disertakan pada pesan WhatsApp.</p>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="nama" className="field-label">
                  Nama lengkap <span className="text-terracotta-dark">*</span>
                </label>
                <input
                  id="nama"
                  className="field"
                  value={customer.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "nama-error" : undefined}
                  placeholder="Contoh: Rani Puspita"
                  autoComplete="name"
                />
                {errors.name && (
                  <p id="nama-error" className="mt-1 text-xs text-terracotta-dark">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="telepon" className="field-label">
                  Nomor WhatsApp <span className="text-terracotta-dark">*</span>
                </label>
                <input
                  id="telepon"
                  className="field"
                  value={customer.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "telepon-error" : undefined}
                  placeholder="081234567890"
                  inputMode="tel"
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p id="telepon-error" className="mt-1 text-xs text-terracotta-dark">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="alamat" className="field-label">
                  Alamat pengiriman <span className="text-terracotta-dark">*</span>
                </label>
                <textarea
                  id="alamat"
                  className="field min-h-20 resize-y"
                  value={customer.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={errors.address ? "alamat-error" : undefined}
                  placeholder="Jalan, nomor rumah, kelurahan, kecamatan, kota"
                  autoComplete="street-address"
                />
                {errors.address && (
                  <p id="alamat-error" className="mt-1 text-xs text-terracotta-dark">
                    {errors.address}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="catatan" className="field-label">
                  Catatan tambahan
                </label>
                <textarea
                  id="catatan"
                  className="field min-h-16 resize-y"
                  value={customer.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Contoh: kirim sore hari setelah pukul 16.00"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-accent mt-5 w-full">
              <MessageCircle className="size-4" aria-hidden /> Checkout via WhatsApp
            </button>

            <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Pesanan belum dianggap dibayar atau diterima sebelum ada konfirmasi dari pihak toko melalui
              WhatsApp.
            </p>

            {checkoutDone && (
              <div
                role="status"
                className="mt-4 flex items-start gap-2 rounded-2xl bg-olive-soft px-3 py-3 text-xs leading-relaxed text-olive-dark"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  Rincian pesanan sudah disiapkan di WhatsApp. Kirim pesan tersebut agar admin dapat
                  memproses pesanan Anda.
                </span>
              </div>
            )}
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Kosongkan keranjang?"
        description="Semua produk pada keranjang akan dihapus. Tindakan ini tidak memengaruhi data produk."
        confirmLabel="Ya, kosongkan"
        onConfirm={() => {
          clear();
          setConfirmClear(false);
          setCheckoutDone(false);
          notify("Keranjang dikosongkan.", "info");
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
