import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Tauri expects a fixed port, fail if it's not available
  server: {
    port: 5173,
    strictPort: true,
  },
  // Env variables starting with the item of `envPrefix` will be exposed in tauri source.
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_PLATFORM === "windows" ? "chrome105" : "safari13",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // 将大型依赖分离
          'vendor-react': ['react', 'react-dom'],
          'vendor-flow': ['reactflow', '@reactflow/core', '@reactflow/controls', '@reactflow/minimap', '@reactflow/background'],
          'vendor-tauri': ['@tauri-apps/api'],
          'vendor-utils': ['zod', 'zustand'],
          // 将引擎代码分离
          'engine': ['./src/engine/index.ts'],
          'logger': ['./src/logger/index.ts'],
        },
      },
    },
    // Chunk size warning
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Enable asset inlining threshold
    assetsInlineLimit: 4096,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'reactflow', 'zod', 'zustand'],
    exclude: ['@tauri-apps/api'],
  },
});
