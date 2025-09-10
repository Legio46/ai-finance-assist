import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

import { defineConfig } from 'vite';

export default defineConfig({
base: './',              // ensure relative paths, e.g. in index.html
build: {
    outDir: 'dist',      // gets deployed to github pages
    assetsDir: 'assets', // static assets (images, js, css, etc.)
},
});
