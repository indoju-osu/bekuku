import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { seedArticles, seedCategories, seedProducts, seedSettings } from "@/data/seed";
import { readJson, removeKey, STORAGE_KEYS, writeJson, type WriteResult } from "@/lib/storage";
import { clearImages } from "@/lib/imageStore";
import { createId, slugify, uniqueSlug } from "@/lib/format";
import type { Article, Category, Product, StoreSettings } from "@/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type ProductInput = Omit<Product, "id" | "slug" | "createdAt" | "updatedAt"> & {
  slug?: string;
};
export type CategoryInput = Pick<Category, "name" | "description">;
export type ArticleInput = Omit<Article, "id" | "slug" | "createdAt" | "updatedAt"> & {
  slug?: string;
};

interface AppDataValue {
  ready: boolean;
  storageWarning: string | null;
  products: Product[];
  categories: Category[];
  articles: Article[];
  settings: StoreSettings;
  categoryById: (id: string) => Category | undefined;
  saveProduct: (input: ProductInput, id?: string) => ActionResult;
  deleteProduct: (id: string) => ActionResult;
  saveCategory: (input: CategoryInput, id?: string) => ActionResult;
  deleteCategory: (id: string) => ActionResult;
  saveArticle: (input: ArticleInput, id?: string) => ActionResult;
  deleteArticle: (id: string) => ActionResult;
  updateSettings: (patch: Partial<StoreSettings>) => ActionResult;
  resetDemoData: () => Promise<void>;
  dismissStorageWarning: () => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

function loadProducts(): Product[] {
  const stored = readJson<Product[] | null>(STORAGE_KEYS.products, null);
  if (!Array.isArray(stored)) return seedProducts;
  return stored.filter((item) => item && typeof item.id === "string" && typeof item.name === "string");
}

function loadCategories(): Category[] {
  const stored = readJson<Category[] | null>(STORAGE_KEYS.categories, null);
  if (!Array.isArray(stored) || stored.length === 0) return seedCategories;
  return stored;
}

function loadArticles(): Article[] {
  const stored = readJson<Article[] | null>(STORAGE_KEYS.articles, null);
  if (!Array.isArray(stored)) return seedArticles;
  return stored;
}

function loadSettings(): StoreSettings {
  const stored = readJson<Partial<StoreSettings> | null>(STORAGE_KEYS.settings, null);
  if (!stored || typeof stored !== "object") return seedSettings;
  return { ...seedSettings, ...stored };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [categories, setCategories] = useState<Category[]>(loadCategories);
  const [articles, setArticles] = useState<Article[]>(loadArticles);
  const [settings, setSettings] = useState<StoreSettings>(loadSettings);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const seededRef = useRef(false);

  // First run: materialise the demo dataset so a reset restores it verbatim.
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    if (!readJson<boolean>(STORAGE_KEYS.seeded, false)) {
      writeJson(STORAGE_KEYS.products, products);
      writeJson(STORAGE_KEYS.categories, categories);
      writeJson(STORAGE_KEYS.articles, articles);
      writeJson(STORAGE_KEYS.settings, settings);
      writeJson(STORAGE_KEYS.seeded, true);
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const report = useCallback((result: WriteResult) => {
    if (!result.ok) setStorageWarning(result.error);
    return result;
  }, []);

  const persistProducts = useCallback(
    (next: Product[]) => {
      const result = writeJson(STORAGE_KEYS.products, next);
      report(result);
      if (result.ok) setProducts(next);
      return result;
    },
    [report],
  );

  const persistCategories = useCallback(
    (next: Category[]) => {
      const result = writeJson(STORAGE_KEYS.categories, next);
      report(result);
      if (result.ok) setCategories(next);
      return result;
    },
    [report],
  );

  const persistArticles = useCallback(
    (next: Article[]) => {
      const result = writeJson(STORAGE_KEYS.articles, next);
      report(result);
      if (result.ok) setArticles(next);
      return result;
    },
    [report],
  );

  const saveProduct = useCallback(
    (input: ProductInput, id?: string): ActionResult => {
      const timestamp = new Date().toISOString();
      if (id) {
        const existing = products.find((item) => item.id === id);
        if (!existing) return { ok: false, error: "Produk tidak ditemukan." };
        const others = products.filter((item) => item.id !== id).map((item) => item.slug);
        const nextProduct: Product = {
          ...existing,
          ...input,
          slug: slugify(input.slug || input.name) || uniqueSlug(input.name, others),
          updatedAt: timestamp,
        };
        const next = products.map((item) => (item.id === id ? nextProduct : item));
        const result = persistProducts(next);
        return result.ok ? { ok: true } : { ok: false, error: result.error };
      }
      const nextProduct: Product = {
        ...input,
        id: createId("prd"),
        slug: uniqueSlug(input.slug || input.name, products.map((item) => item.slug)),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const result = persistProducts([nextProduct, ...products]);
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    },
    [persistProducts, products],
  );

  const deleteProduct = useCallback(
    (id: string): ActionResult => {
      const result = persistProducts(products.filter((item) => item.id !== id));
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    },
    [persistProducts, products],
  );

  const saveCategory = useCallback(
    (input: CategoryInput, id?: string): ActionResult => {
      const name = input.name.trim();
      if (!name) return { ok: false, error: "Nama kategori wajib diisi." };
      if (id) {
        const exists = categories.some((item) => item.id === id);
        if (!exists) return { ok: false, error: "Kategori tidak ditemukan." };
        const others = categories.filter((item) => item.id !== id).map((item) => item.slug);
        const next = categories.map((item) =>
          item.id === id
            ? { ...item, name, description: input.description, slug: uniqueSlug(name, others) }
            : item,
        );
        const result = persistCategories(next);
        return result.ok ? { ok: true } : { ok: false, error: result.error };
      }
      const nextCategory: Category = {
        id: createId("cat"),
        name,
        slug: uniqueSlug(name, categories.map((item) => item.slug)),
        description: input.description,
        createdAt: new Date().toISOString(),
      };
      const result = persistCategories([...categories, nextCategory]);
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    },
    [categories, persistCategories],
  );

  const deleteCategory = useCallback(
    (id: string): ActionResult => {
      const used = products.filter((item) => item.categoryId === id).length;
      if (used > 0) {
        return {
          ok: false,
          error: `Kategori masih dipakai oleh ${used} produk. Pindahkan produk tersebut terlebih dahulu.`,
        };
      }
      const result = persistCategories(categories.filter((item) => item.id !== id));
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    },
    [categories, persistCategories, products],
  );

  const saveArticle = useCallback(
    (input: ArticleInput, id?: string): ActionResult => {
      const timestamp = new Date().toISOString();
      if (id) {
        const existing = articles.find((item) => item.id === id);
        if (!existing) return { ok: false, error: "Artikel tidak ditemukan." };
        const others = articles.filter((item) => item.id !== id).map((item) => item.slug);
        const nextArticle: Article = {
          ...existing,
          ...input,
          slug: uniqueSlug(input.slug || input.title, others),
          updatedAt: timestamp,
        };
        const result = persistArticles(articles.map((item) => (item.id === id ? nextArticle : item)));
        return result.ok ? { ok: true } : { ok: false, error: result.error };
      }
      const nextArticle: Article = {
        ...input,
        id: createId("art"),
        slug: uniqueSlug(input.slug || input.title, articles.map((item) => item.slug)),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const result = persistArticles([nextArticle, ...articles]);
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    },
    [articles, persistArticles],
  );

  const deleteArticle = useCallback(
    (id: string): ActionResult => {
      const result = persistArticles(articles.filter((item) => item.id !== id));
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    },
    [articles, persistArticles],
  );

  const updateSettings = useCallback(
    (patch: Partial<StoreSettings>): ActionResult => {
      const next = { ...settings, ...patch };
      const result = writeJson(STORAGE_KEYS.settings, next);
      report(result);
      if (result.ok) setSettings(next);
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    },
    [report, settings],
  );

  const resetDemoData = useCallback(async () => {
    removeKey(STORAGE_KEYS.products);
    removeKey(STORAGE_KEYS.categories);
    removeKey(STORAGE_KEYS.articles);
    removeKey(STORAGE_KEYS.settings);
    removeKey(STORAGE_KEYS.cart);
    removeKey(STORAGE_KEYS.seeded);
    await clearImages();
    setProducts(seedProducts);
    setCategories(seedCategories);
    setArticles(seedArticles);
    setSettings(seedSettings);
    writeJson(STORAGE_KEYS.products, seedProducts);
    writeJson(STORAGE_KEYS.categories, seedCategories);
    writeJson(STORAGE_KEYS.articles, seedArticles);
    writeJson(STORAGE_KEYS.settings, seedSettings);
    writeJson(STORAGE_KEYS.seeded, true);
  }, []);

  const categoryById = useCallback(
    (id: string) => categories.find((item) => item.id === id),
    [categories],
  );

  const value = useMemo<AppDataValue>(
    () => ({
      ready,
      storageWarning,
      products,
      categories,
      articles,
      settings,
      categoryById,
      saveProduct,
      deleteProduct,
      saveCategory,
      deleteCategory,
      saveArticle,
      deleteArticle,
      updateSettings,
      resetDemoData,
      dismissStorageWarning: () => setStorageWarning(null),
    }),
    [
      ready,
      storageWarning,
      products,
      categories,
      articles,
      settings,
      categoryById,
      saveProduct,
      deleteProduct,
      saveCategory,
      deleteCategory,
      saveArticle,
      deleteArticle,
      updateSettings,
      resetDemoData,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData harus dipakai di dalam AppDataProvider");
  return context;
}
