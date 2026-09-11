import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Vercel build environment lacks system dependencies for Puppeteer.
    // We conditionally disable the prerender plugin when building on Vercel.
    process.env.VERCEL !== '1' && prerender({
      // Pre-render only public/static pages — skip auth, dashboard, admin, and dynamic routes
      routes: [
        '/',
        '/pricing',
        '/services',
        '/service2',
        '/aboutus',
        '/aboutus2',
        '/team',
        '/detail-review',
      ],
      renderer: '@prerenderer/renderer-puppeteer',
      rendererOptions: {
        // Wait 2 seconds for the SPA to fully render before snapshotting
        renderAfterTime: 2000,
      },
    }),
  ].filter(Boolean),
  root: '.',  // Ensures Vite looks in the correct folder
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
  resolve: {
    alias: {
      // Define an alias for the src directory
      '@': path.resolve(__dirname, './src'),
      // Add an alias for assets
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    historyApiFallback: true,
    proxy: {
      "/api": {
        // target: "http://localhost:4000",
        // target: ["http://localhost:4000", "http://192.168.0.107:4000/"],
        target: "https://medicare-backend-vl01.onrender.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        ws: true, // Enable WebSocket proxying
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
            console.error('Error details:', {
              message: err.message,
              code: err.code,
              stack: err.stack
            });
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', {
              method: req.method,
              url: req.url,
              path: req.path,
              headers: proxyReq.getHeaders()
            });

            // Ensure Authorization header is properly forwarded
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }

            // For multipart/form-data requests, ensure the content-type header is preserved
            if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
              console.log('Handling multipart/form-data request');
              // Don't modify the content-type header for multipart/form-data
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', {
              statusCode: proxyRes.statusCode,
              url: req.url,
              headers: proxyRes.headers
            });

            // Log 404 errors with more details
            if (proxyRes.statusCode === 404) {
              console.error('404 Error Details:', {
                method: req.method,
                url: req.url,
                path: req.path,
                headers: req.headers,
                body: req.body
              });
            }
          });
        },
      }
    },
  },
})
