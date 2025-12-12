import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
<<<<<<< HEAD
    port: 5173,
=======
    port: 3000,
>>>>>>> 4a519201c77062e5487d87a8d07b44f3e1fcebf9
    allowedHosts: ["dev-wordit.it-its.id", "wordit.it-its.id"],
  },
  preview: {
    host: true,
    port: 3001,
    allowedHosts: ["dev-wordit.it-its.id", "wordit.it-its.id"],
  },
});
