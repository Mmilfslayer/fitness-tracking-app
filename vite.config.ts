import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Fitness Tracking App',
        short_name: 'FitnessApp',
        description: 'A comprehensive fitness tracking application with AI-powered nutrition parsing and workout generation',
        theme_color: '#007AFF',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'apple-touch-icon.svg',
            sizes: '180x180',
            type: 'image/svg+xml',
            purpose: 'apple touch icon'
          }
        ],
        categories: ['health', 'fitness', 'lifestyle'],
        shortcuts: [
          {
            name: 'Log Workout',
            short_name: 'Workout',
            description: 'Start a new workout session',
            url: '/workout',
            icons: [{ src: 'workout-icon.svg', sizes: '192x192', type: 'image/svg+xml' }]
          },
          {
            name: 'View Progress',
            short_name: 'Progress',
            description: 'View your fitness progress',
            url: '/progress',
            icons: [{ src: 'progress-icon.svg', sizes: '192x192', type: 'image/svg+xml' }]
          }
        ],
        screenshots: [
          {
            src: 'screenshot-wide.svg',
            sizes: '1280x720',
            type: 'image/svg+xml',
            form_factor: 'wide',
            label: 'Fitness Dashboard'
          },
          {
            src: 'screenshot-narrow.svg',
            sizes: '750x1334',
            type: 'image/svg+xml',
            form_factor: 'narrow',
            label: 'Workout Tracker'
          }
        ],
        prefer_related_applications: false,
        related_applications: [],
        // Additional PWA features
        display_override: ['window-controls-overlay', 'standalone'],
        handle_links: 'preferred',
        launch_handler: {
          client_mode: 'focus-existing'
        },
        protocol_handlers: [
          {
            protocol: 'web+fitness',
            url: '/?action=%s'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json,woff,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gemini-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/api\.vercel\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'vercel-kv-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        // Ensure navigation requests are handled properly
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/api/,
          /\.json$/,
          /\.xml$/
        ],
        // Clean up old caches
        cleanupOutdatedCaches: true,
        // Maximum file size to cache (2MB)
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/index.html'
      },
      // Use generateSW strategy - the workbox config above handles all caching
      strategies: 'generateSW',
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'],
          charts: ['recharts'],
          ai: ['@google/generative-ai'],
          db: ['dexie'],
        }
      }
    }
  }
});