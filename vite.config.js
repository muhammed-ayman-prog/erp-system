import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({

  plugins: [

    react(),

    VitePWA({

      registerType: "autoUpdate",


      workbox: {

      maximumFileSizeToCacheInBytes:
        5 * 1024 * 1024

    },

      manifest: {

        name: "A Perfume Story",

        short_name: "APS",

        description:
          "Management & Inventory System",

        theme_color: "#111827",

        background_color: "#f8fafc",

        display: "standalone",

        orientation: "portrait",

        scope: "/",

        start_url: "/",

        icons: [

          {
            src: "/pwa-192.png",

            sizes: "192x192",

            type: "image/png"
          },

          {
            src: "/pwa-512.png",

            sizes: "512x512",

            type: "image/png"
          }

        ]

      }

    })

  ]

});