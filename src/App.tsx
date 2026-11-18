import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { PublicLayout, ScrollToTop } from "@/components/public/PublicLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { getSession } from "@/lib/adminAuth";
import { HomePage } from "@/pages/public/HomePage";
import { CatalogPage } from "@/pages/public/CatalogPage";
import { ProductDetailPage } from "@/pages/public/ProductDetailPage";
import { CategoryPage } from "@/pages/public/CategoryPage";
import { CartPage } from "@/pages/public/CartPage";
import { AboutPage } from "@/pages/public/AboutPage";
import { BlogPage } from "@/pages/public/BlogPage";
import { BlogDetailPage } from "@/pages/public/BlogDetailPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminOverviewPage } from "@/pages/admin/AdminOverviewPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminCategoriesPage } from "@/pages/admin/AdminCategoriesPage";
import { AdminArticlesPage } from "@/pages/admin/AdminArticlesPage";
import { AdminStockPage } from "@/pages/admin/AdminStockPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";

function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!getSession()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/produk" element={<CatalogPage />} />
          <Route path="/produk/:slug" element={<ProductDetailPage />} />
          <Route path="/kategori" element={<CategoryPage />} />
          <Route path="/keranjang" element={<CartPage />} />
          <Route path="/tentang" element={<AboutPage />} />
          <Route path="/artikel" element={<BlogPage />} />
          <Route path="/artikel/:slug" element={<BlogDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="produk" element={<AdminProductsPage />} />
          <Route path="kategori" element={<AdminCategoriesPage />} />
          <Route path="artikel" element={<AdminArticlesPage />} />
          <Route path="stok" element={<AdminStockPage />} />
          <Route path="pengaturan" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </>
  );
}
