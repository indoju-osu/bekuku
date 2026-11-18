import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "@/App";
import { AppDataProvider } from "@/store/AppDataContext";
import { CartProvider } from "@/store/CartContext";
import { ToastProvider } from "@/store/ToastContext";
import "@/index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Elemen #root tidak ditemukan");

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AppDataProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AppDataProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
