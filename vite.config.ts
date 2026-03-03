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
  // No custom module aliases – keep the Vite configuration as
  // minimal and idiomatic as possible for a plain React project.
  // If you previously used `@` or `figma:` imports they have been
  // rewritten to standard relative paths in the source files.

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
