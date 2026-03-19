import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": process.env.API_URL || "http://localhost:3001",
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
    },
  },
  optimizeDeps: {
    exclude: ["kokoro-js", "@huggingface/transformers"],
  },
  worker: {
    format: "es",
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
