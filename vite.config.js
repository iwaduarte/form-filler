import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webExtension from "@samrum/vite-plugin-web-extension";
import manifest from "./manifest.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest,
      webAccessibleScripts: {
        include: /\.([cem]?js|jsx|ts)$/,
      },
    }),
  ],
});
