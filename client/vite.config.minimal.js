import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },
  server: {
    historyApiFallback: true,
  },
  preview: {
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // Use esbuild instead of terser for less memory
    rollupOptions: {
      output: {
        // Aggressive chunking to reduce memory usage
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'radix-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-toast'],
          'utils': ['axios', 'jwt-decode'],
          'gsap': ['gsap'],
        },
        // Smaller chunk size limit
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // Reduce parallelism to save memory
      maxParallelFileOps: 1,
    },
    // Reduce chunk size warning
    chunkSizeWarningLimit: 500,
    // Use esbuild for faster, less memory-intensive builds
    target: 'es2015',
    cssCodeSplit: true,
    // Disable some optimizations that use more memory
    reportCompressedSize: false,
    emptyOutDir: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
  }
});
