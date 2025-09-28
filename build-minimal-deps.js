#!/usr/bin/env node

// Minimal dependencies build - only install what's absolutely necessary
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting minimal dependencies build...');

try {
  // Set extremely conservative memory limits
  process.env.NODE_ENV = 'production';
  process.env.NODE_OPTIONS = '--max-old-space-size=150 --optimize-for-size --gc-interval=25';
  
  console.log('📦 Installing only essential dependencies...');
  
  // Install only production dependencies for client
  console.log('📥 Installing client production dependencies only...');
  const clientEnv = { 
    ...process.env,
    npm_config_production: 'true',
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    npm_config_update_notifier: 'false'
  };
  
  execSync('npm install --production --no-audit --no-fund --no-update-notifier', { 
    cwd: path.join(__dirname, 'client'), 
    stdio: 'inherit',
    env: clientEnv
  });
  
  // Install only essential devDependencies
  console.log('📥 Installing essential devDependencies...');
  const devEnv = { 
    ...process.env,
    npm_config_production: 'false',
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    npm_config_update_notifier: 'false'
  };
  
  // Install only vite and essential build tools
  execSync('npm install vite @vitejs/plugin-react --no-audit --no-fund', { 
    cwd: path.join(__dirname, 'client'), 
    stdio: 'inherit',
    env: devEnv
  });
  
  // Install server dependencies
  console.log('📥 Installing server dependencies...');
  execSync('npm install --no-audit --no-fund', { 
    cwd: path.join(__dirname, 'server'), 
    stdio: 'inherit' 
  });
  
  // Install root dependencies
  console.log('📥 Installing root dependencies...');
  execSync('npm install --no-audit --no-fund', { stdio: 'inherit' });
  
  // Verify vite is installed
  console.log('🔍 Verifying vite installation...');
  const vitePath = path.join(__dirname, 'client', 'node_modules', 'vite');
  if (!fs.existsSync(vitePath)) {
    throw new Error('Vite not found after installation');
  }
  console.log('✅ Vite found');
  
  // Create ultra-minimal vite config
  console.log('🔧 Creating ultra-minimal Vite configuration...');
  const minimalConfig = `
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
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
    target: 'es2015',
    cssCodeSplit: false,
    reportCompressedSize: false,
    emptyOutDir: true,
  },
});
`;
  
  fs.writeFileSync(path.join(__dirname, 'client', 'vite.config.js'), minimalConfig);
  
  // Build with minimal memory settings
  console.log('🔨 Building with minimal memory settings...');
  const buildEnv = { 
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=150 --optimize-for-size --gc-interval=25',
    NODE_ENV: 'production'
  };
  
  // Clear any existing build
  try {
    execSync('rm -rf dist', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  } catch (e) {
    // Ignore if dist doesn't exist
  }
  
  execSync('npm run build', { 
    cwd: path.join(__dirname, 'client'), 
    stdio: 'inherit',
    env: buildEnv
  });
  
  // Verify client build
  const distPath = path.join(__dirname, 'client', 'dist');
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Client build failed - index.html not found');
  }
  console.log('✅ Minimal dependencies build completed');
  
  console.log('✅ Minimal dependencies build completed successfully');
  
} catch (error) {
  console.error('❌ Minimal dependencies build failed:', error.message);
  console.log('💡 Consider upgrading to Render paid plan for more memory');
  process.exit(1);
}
