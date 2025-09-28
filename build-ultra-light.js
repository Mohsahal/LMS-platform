#!/usr/bin/env node

// Ultra-lightweight build script for Render free tier (512MB limit)
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting ultra-lightweight build for Render free tier...');

try {
  // Set ultra-conservative memory limits
  process.env.NODE_ENV = 'production';
  process.env.NODE_OPTIONS = '--max-old-space-size=400 --optimize-for-size';
  
  console.log('📦 Installing dependencies with minimal memory...');
  
  // Install only production dependencies for client
  console.log('📥 Installing client production dependencies only...');
  const clientEnv = { ...process.env };
  clientEnv.npm_config_production = 'true';
  clientEnv.npm_config_audit = 'false';
  clientEnv.npm_config_fund = 'false';
  
  execSync('npm install --production --no-audit --no-fund', { 
    cwd: path.join(__dirname, 'client'), 
    stdio: 'inherit',
    env: clientEnv
  });
  
  // Install devDependencies separately with minimal memory
  console.log('📥 Installing client devDependencies with minimal memory...');
  const devEnv = { ...process.env };
  devEnv.npm_config_production = 'false';
  devEnv.npm_config_audit = 'false';
  devEnv.npm_config_fund = 'false';
  
  execSync('npm install --no-audit --no-fund', { 
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
  
  // Build client with ultra-minimal memory usage
  console.log('🔨 Building client with ultra-minimal memory...');
  const buildEnv = { 
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=400 --optimize-for-size',
    NODE_ENV: 'production'
  };
  
  // Clear any existing build
  try {
    execSync('rm -rf dist', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  } catch (e) {
    // Ignore if dist doesn't exist
  }
  
  // Use minimal vite config
  console.log('🔧 Using minimal Vite configuration...');
  execSync('cp vite.config.minimal.js vite.config.js', { 
    cwd: path.join(__dirname, 'client'), 
    stdio: 'inherit' 
  });
  
  try {
    execSync('npm run build', { 
      cwd: path.join(__dirname, 'client'), 
      stdio: 'inherit',
      env: buildEnv
    });
  } catch (error) {
    console.log('⚠️ Ultra-light build failed, trying emergency build...');
    execSync('node build-emergency.js', { 
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
  console.log('✅ Client build completed');
  
  console.log('✅ Ultra-lightweight build completed successfully');
  
} catch (error) {
  console.error('❌ Ultra-lightweight build failed:', error.message);
  process.exit(1);
}
