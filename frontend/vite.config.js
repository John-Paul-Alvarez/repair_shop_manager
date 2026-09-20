import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
var stdin_default = defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { "/api": "http://127.0.0.1:4000" } },
  preview: { proxy: { "/api": "http://127.0.0.1:4000" } },
});
export { stdin_default as default };
