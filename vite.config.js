// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      formats: ["es", "cjs"],
      entry: "lib/index.ts",
      fileName: (format) => `next-pocketbase-auth.${format}.js`,
    },
    rollupOptions: {
      external: ["pocketbase", /^next.*/, /^react.*/, "js-cookie"],
    },
  },
});
