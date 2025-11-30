import { VitePWA } from "vite-plugin-pwa"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import * as path from "node:path"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import tailwindcss from "@tailwindcss/vite"
import { livestoreDevtoolsPlugin } from "@livestore/devtools-vite"

const APP = process.env.APP || "cheffect"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: `src/apps/${APP}/routes`,
      generatedRouteTree: `src/apps/${APP}/routeTree.gen.ts`,
    }),
    react(),
    tailwindcss(),
    livestoreDevtoolsPlugin({
      schemaPath: `./src/apps/${APP}/livestore/schema.ts`,
    }),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        id: `${APP}.datarooms.dev`,
        name: APP.charAt(0).toUpperCase() + APP.slice(1),
        short_name: APP.charAt(0).toUpperCase() + APP.slice(1),
        description: `A local-first ${APP} app`,
        theme_color: "#0d5257",
        background_color: "#0d5257",
        shortcuts: [],
        launch_handler: {
          client_mode: "navigate-existing",
        },
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,wasm}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 6_000_000,
      },

      devOptions: {
        enabled: false,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
  ],

  build: {
    minify: false,
    terserOptions: {
      compress: false,
      mangle: false,
    },
    outDir: `dist/${APP}`,
  },

  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "src/_shared"),
      "@app": path.resolve(__dirname, `src/apps/${APP}`),
      "@": path.resolve(__dirname, "src"),
    },
  },

  worker: { format: "es" },

  optimizeDeps: {
    exclude: ["@livestore/wa-sqlite"],
  },
})
