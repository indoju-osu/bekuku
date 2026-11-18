import { useEffect, useMemo, useState } from "react";
import { Save, X } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useAppData, type ProductInput } from "@/store/AppDataContext";
import { slugify } from "@/lib/format";
import type { ImageRef, Product } from "@/types";

interface ProductFormProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
}

interface FormState {
  name: string;
  categoryId: string;
  description: string;
  price: string;
  discountPrice: string;
  weight: string;
  stock: string;
  status: Product["status"];
  isFeatured: boolean;
  isNew: boolean;
  image: ImageRef;
}

const emptyState = (categoryId: string): FormState => ({
  name: "",
  categoryId,
  description: "",
  price: "",
  discountPrice: "",
  weight: "",
  stock: "0",
  status: "active",
  isFeatured: false,
  isNew: false,
  image: null,
});

type FormErrors = Partial<Record<keyof FormState, string>>;

export function ProductForm({ open, product, onClose, onSaved, onError }: ProductFormProps) {
  const { categories, saveProduct, products } = useAppData();
  const [form, setForm] = useState<FormState>(() => emptyState(categories[0]?.id ?? ""));
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description,
        price: String(product.price),
        discountPrice: product.discountPrice ? String(product.discountPrice) : "",
        weight: product.weight,
        stock: String(product.stock),
        status: product.status,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        image: product.image,
      });
    } else {
      setForm(emptyState(categories[0]?.id ?? ""));
    }
    setErrors({});
  }, [open, product, categories]);

  const slugPreview = useMemo(() => slugify(form.name) || "nama-produk", [form.name]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (form.name.trim().length < 3) next.name = "Nama produk minimal 3 karakter.";
    if (!form.categoryId) next.categoryId = "Pilih kategori produk.";
    if (form.description.trim().length < 20) next.description = "Deskripsi minimal 20 karakter.";
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) next.price = "Harga harus lebih dari 0.";
    if (form.discountPrice) {
      const discount = Number(form.discountPrice);
      if (!Number.isFinite(discount) || discount <= 0) {
        next.discountPrice = "Harga diskon tidak valid.";
      } else if (discount >= price) {
        next.discountPrice = "Harga diskon harus lebih kecil dari harga normal.";
      }
    }
    if (!form.weight.trim()) next.weight = "Isi berat atau ukuran kemasan.";
    const stock = Number(form.stock);
    if (!Number.isInteger(stock) || stock < 0) next.stock = "Stok harus bilangan bulat 0 atau lebih.";
    const duplicate = products.some(
      (item) => item.slug === slugPreview && item.id !== product?.id,
    );
    if (duplicate) next.name = "Nama produk menghasilkan slug yang sudah dipakai.";
    return next;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      onError("Periksa kembali data produk yang ditandai merah.");
      return;
    }
    setSaving(true);
    const payload: ProductInput = {
      name: form.name.trim(),
      slug: slugPreview,
      categoryId: form.categoryId,
      description: form.description.trim(),
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      weight: form.weight.trim(),
      stock: Number(form.stock),
      status: form.status,
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      sold: product?.sold ?? 0,
      image: form.image,
    };
    const result = saveProduct(payload, product?.id);
    setSaving(false);
    if (!result.ok) {
      onError(result.error);
      return;
    }
    onSaved(product ? "Produk berhasil diperbarui." : "Produk baru berhasil ditambahkan.");
  };

  return (
    <div className="fixed inset-0 z-90 flex items-start justify-center overflow-y-auto bg-navy/50 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="my-6 w-full max-w-3xl rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-navy/8 px-5 py-4">
          <h2 id="product-form-title" className="font-display text-xl">
            {product ? "Edit produk" : "Tambah produk baru"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted transition hover:bg-navy/5"
            aria-label="Tutup formulir"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto px-5 py-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
            <ImageUploader value={form.image} onChange={(next) => set("image", next)} label="Foto produk (wajib nyata)" />

            <div className="space-y-4">
              <div>
                <label htmlFor="product-name" className="field-label">
                  Nama produk <span className="text-terracotta-dark">*</span>
                </label>
                <input
                  id="product-name"
                  className="field"
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  placeholder="Contoh: Nugget Ayam Premium"
                />
                {errors.name ? (
                  <p className="mt-1 text-xs text-terracotta-dark">{errors.name}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-muted">Slug: /produk/{slugPreview}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="product-category" className="field-label">
                    Kategori <span className="text-terracotta-dark">*</span>
                  </label>
                  <select
                    id="product-category"
                    className="field"
                    value={form.categoryId}
                    onChange={(event) => set("categoryId", event.target.value)}
                    aria-invalid={Boolean(errors.categoryId)}
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-xs text-terracotta-dark">{errors.categoryId}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="product-weight" className="field-label">
                    Berat / isi <span className="text-terracotta-dark">*</span>
                  </label>
                  <input
                    id="product-weight"
                    className="field"
                    value={form.weight}
                    onChange={(event) => set("weight", event.target.value)}
                    aria-invalid={Boolean(errors.weight)}
                    placeholder="500 gram / 20 pcs"
                  />
                  {errors.weight && <p className="mt-1 text-xs text-terracotta-dark">{errors.weight}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="product-description" className="field-label">
                  Deskripsi <span className="text-terracotta-dark">*</span>
                </label>
                <textarea
                  id="product-description"
                  className="field min-h-24 resize-y"
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                  aria-invalid={Boolean(errors.description)}
                  placeholder="Jelaskan rasa, tekstur, cara penyajian, dan keunggulan produk."
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-terracotta-dark">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="product-price" className="field-label">
                Harga normal <span className="text-terracotta-dark">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                min={0}
                step={500}
                className="field"
                value={form.price}
                onChange={(event) => set("price", event.target.value)}
                aria-invalid={Boolean(errors.price)}
                placeholder="32000"
              />
              {errors.price && <p className="mt-1 text-xs text-terracotta-dark">{errors.price}</p>}
            </div>
            <div>
              <label htmlFor="product-discount" className="field-label">
                Harga diskon
              </label>
              <input
                id="product-discount"
                type="number"
                min={0}
                step={500}
                className="field"
                value={form.discountPrice}
                onChange={(event) => set("discountPrice", event.target.value)}
                aria-invalid={Boolean(errors.discountPrice)}
                placeholder="Kosongkan bila tidak promo"
              />
              {errors.discountPrice && (
                <p className="mt-1 text-xs text-terracotta-dark">{errors.discountPrice}</p>
              )}
            </div>
            <div>
              <label htmlFor="product-stock" className="field-label">
                Stok <span className="text-terracotta-dark">*</span>
              </label>
              <input
                id="product-stock"
                type="number"
                min={0}
                step={1}
                className="field"
                value={form.stock}
                onChange={(event) => set("stock", event.target.value)}
                aria-invalid={Boolean(errors.stock)}
              />
              {errors.stock && <p className="mt-1 text-xs text-terracotta-dark">{errors.stock}</p>}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="product-status" className="field-label">
                Status produk
              </label>
              <select
                id="product-status"
                className="field"
                value={form.status}
                onChange={(event) => set("status", event.target.value as Product["status"])}
              >
                <option value="active">Aktif — tampil di katalog</option>
                <option value="draft">Draf — disembunyikan dari publik</option>
              </select>
            </div>
            <fieldset className="rounded-2xl border border-navy/10 p-3">
              <legend className="px-1 text-xs font-semibold text-navy">Label produk</legend>
              <label className="flex items-center gap-2 text-sm text-charcoal/80">
                <input
                  type="checkbox"
                  className="size-4 accent-terracotta"
                  checked={form.isFeatured}
                  onChange={(event) => set("isFeatured", event.target.checked)}
                />
                Best Seller
              </label>
              <label className="mt-2 flex items-center gap-2 text-sm text-charcoal/80">
                <input
                  type="checkbox"
                  className="size-4 accent-terracotta"
                  checked={form.isNew}
                  onChange={(event) => set("isNew", event.target.checked)}
                />
                New Arrival
              </label>
            </fieldset>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-navy/8 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save className="size-4" aria-hidden /> {saving ? "Menyimpan…" : "Simpan produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
