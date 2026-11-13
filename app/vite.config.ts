import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const appDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: appDirectory,
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:3001",
      "/socket.io": {
        target: "http://127.0.0.1:3001",
        ws: true
      }
    }
  },
  build: {
    outDir: resolve(appDirectory, "../dist"),
    emptyOutDir: true
  }
});