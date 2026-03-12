import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],

  // Proxy API and SSE requests to CTFd backend during local development
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/events": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/login": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/logout": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],

  // Set base path for CTFd theme
  base: "/themes/Ramadhan/static/",

  // Build configuration for CTFd theme deployment
  build: {
    outDir: "static", // Output to static/ for CTFd
    assetsDir: "assets", // Assets go to static/assets/
    emptyOutDir: true, // Clean output before building
  },
});
