import { defineConfig } from "vite";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    hmr: false
  },
  preview: {
    host: "0.0.0.0",
    port: 3000
  }
});
