#!/usr/bin/env node

// Micro build script - extreme memory optimization for Render free tier
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting micro build for Render free tier...');

try {
  // Set extremely conservative memory limits
  process.env.NODE_ENV = 'production';
  process.env.NODE_OPTIONS = '--max-old-space-size=200 --optimize-for-size --gc-interval=50';
  
  console.log('📦 Installing minimal dependencies...');
  
  // Install client dependencies with minimal memory
  console.log('📥 Installing client dependencies...');
  const clientEnv = { 
    ...process.env,
    npm_config_production: 'false',
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    npm_config_update_notifier: 'false'
  };
  
  execSync('npm install --no-audit --no-fund --no-update-notifier', { 
    cwd: path.join(__dirname, 'client'), 
    stdio: 'inherit',
    env: clientEnv
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
          'router': ['react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2015',
    cssCodeSplit: false,
    reportCompressedSize: false,
    emptyOutDir: true,
  },
});
`;
  
  fs.writeFileSync(path.join(__dirname, 'client', 'vite.config.js'), minimalConfig);
  
  // Build with micro memory settings
  console.log('🔨 Building with micro memory settings...');
  const buildEnv = { 
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=200 --optimize-for-size --gc-interval=50',
    NODE_ENV: 'production'
  };
  
  // Clear any existing build
  try {
    execSync('rm -rf dist', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  } catch (e) {
    // Ignore if dist doesn't exist
  }
  
  try {
    execSync('npm run build', { 
      cwd: path.join(__dirname, 'client'), 
      stdio: 'inherit',
      env: buildEnv
    });
  } catch (error) {
    console.log('⚠️ Micro build failed, trying minimal dependencies build...');
    execSync('node build-minimal-deps.js', { 
      cwd: __dirname, 
      stdio: 'inherit' 
    });
  }
  
  // Verify client build
  const distPath = path.join(__dirname, 'client', 'dist');
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Client build failed - index.html not found');
  }
  console.log('✅ Micro build completed');
  
  console.log('✅ Micro build completed successfully');
  
} catch (error) {
  console.error('❌ Micro build failed:', error.message);
  console.log('💡 Consider upgrading to Render paid plan for more memory');
  process.exit(1);
}
