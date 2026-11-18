/** A picture reference: either a bundled asset path or an IndexedDB upload. */
export type ImageRef =
  | { kind: "asset"; path: string }
  | { kind: "upload"; id: string }
  | null;

export type ProductStatus = "active" | "draft";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number;
  /** Final selling price when a discount is running, otherwise null. */
  discountPrice: number | null;
  weight: string;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
  isNew: boolean;
  /** Units sold, used for the "popularitas" sort. */
  sold: number;
  image: ImageRef;
  createdAt: string;
  updatedAt: string;
}

export type ArticleStatus = "draft" | "published";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: ImageRef;
  status: ArticleStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  description: string;
  logo: ImageRef;
  whatsapp: string;
  address: string;
  hours: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  shippingNote: string;
}

export interface CartLine {
  productId: string;
  qty: number;
}

export interface CartItem extends CartLine {
  product: Product;
  unitPrice: number;
  subtotal: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
}

export interface CheckoutCustomer {
  name: string;
  phone: string;
  address: string;
  notes: string;
}
