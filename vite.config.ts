import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Optimize babel config
      babel: {
        plugins: [
          // Remove console.logs in production
          ['transform-remove-console', { exclude: ['error', 'warn'] }]
        ]
      }
    }),
    // Bundle analyzer (only in analyze mode)
    process.env.ANALYZE &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true
      })
  ].filter(Boolean),

  server: {
    port: 3000,
    open: true,
    // Enable compression
    compress: true
  },

  build: {
    outDir: 'dist',
    // Generate sourcemaps only in dev
    sourcemap: process.env.NODE_ENV === 'development',
    // Minify with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Advanced rollup options
    rollupOptions: {
      output: {
        // Aggressive code splitting
        manualChunks: (id) => {
          // React and React DOM
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Charts library
          if (id.includes('node_modules/recharts')) {
            return 'chart-vendor';
          }
          // AI/Gemini
          if (id.includes('node_modules/@google/genai')) {
            return 'ai-vendor';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
          // Shared components
          if (id.includes('/components/Shared/')) {
            return 'shared-components';
          }
          // Passenger components
          if (id.includes('/components/Passenger/')) {
            return 'passenger-components';
          }
          // Driver components
          if (id.includes('/components/Driver/')) {
            return 'driver-components';
          }
          // Entertainment components
          if (id.includes('/components/Entertainment/')) {
            return 'entertainment';
          }
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // CSS code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true,
    // Set target for modern browsers
    target: 'es2020'
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'lucide-react',
      'recharts',
      '@google/genai'
    ],
    // Force pre-bundling
    force: false
  },

  // Enable esbuild optimizations
  esbuild: {
    // Remove unused code
    treeShaking: true,
    // Optimize for production
    minify: true,
    // Target modern browsers
    target: 'es2020',
    // Enable source maps in dev
    sourcemap: process.env.NODE_ENV === 'development'
  },

  // Preview server config
  preview: {
    port: 4173,
    strictPort: true,
    open: true
  }
});
