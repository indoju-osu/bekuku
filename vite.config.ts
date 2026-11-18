import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Extra hostnames (e.g. the cloud preview domain) can be passed through the
// __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS env var; Vite also honours it natively.
const extraHosts = (process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    allowedHosts: extraHosts,
  },
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 1200,
  },
});
