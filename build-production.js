#!/usr/bin/env node

// Production build script for Render deployment
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting production build...');

try {
  // Set production environment
  process.env.NODE_ENV = 'production';
  
  console.log('📦 Installing all dependencies...');
  
  // Install client dependencies with devDependencies
  console.log('📥 Installing client dependencies (including devDependencies)...');
  const clientEnv = { ...process.env };
  clientEnv.npm_config_production = 'false';
  execSync('npm install --include=dev', { 
    cwd: path.join(__dirname, 'client'), 
    stdio: 'inherit',
    env: clientEnv
  });
  
  // Install server dependencies
  console.log('📥 Installing server dependencies...');
  execSync('npm install', { 
    cwd: path.join(__dirname, 'server'), 
    stdio: 'inherit' 
  });
  
  // Install root dependencies
  console.log('📥 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Verify vite is installed
  console.log('🔍 Verifying vite installation...');
  const vitePath = path.join(__dirname, 'client', 'node_modules', 'vite');
  if (!fs.existsSync(vitePath)) {
    throw new Error('Vite not found after installation');
  }
  console.log('✅ Vite found');
  
  // Build client with memory optimization
  console.log('🔨 Building client with memory optimization...');
  try {
    execSync('node build-memory-optimized.js', { 
      cwd: path.join(__dirname, 'client'), 
      stdio: 'inherit'
    });
  } catch (error) {
    console.log('⚠️ Memory-optimized build failed, trying standard build with increased memory...');
    const buildEnv = { 
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=6144'
    };
    execSync('npm run build', { 
      cwd: path.join(__dirname, 'client'), 
      stdio: 'inherit',
      env: buildEnv
    });
  }
  
  // Verify client build
  const distPath = path.join(__dirname, 'client', 'dist');
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Client build failed - index.html not found');
  }
  console.log('✅ Client build completed');
  
  console.log('✅ Production build completed successfully');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
