import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1200,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor";
            }

            if (id.includes("@supabase")) {
              return "supabase";
            }

            if (
              id.includes("jspdf") ||
              id.includes("html2canvas") ||
              id.includes("dompurify")
            ) {
              return "pdf";
            }

            if (id.includes("framer-motion")) {
              return "motion";
            }

            if (id.includes("lucide-react")) {
              return "icons";
            }

            return "dependencies";
          }
        },
      },
    },
  },

  server: {
    host: true,
  },
});