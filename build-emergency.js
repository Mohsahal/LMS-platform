#!/usr/bin/env node

// Emergency build script for extreme memory constraints
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚨 Emergency build for extreme memory constraints...');

try {
  // Set extremely conservative memory limits
  process.env.NODE_ENV = 'production';
  process.env.NODE_OPTIONS = '--max-old-space-size=300 --optimize-for-size --gc-interval=100';
  
  console.log('📦 Installing minimal dependencies...');
  
  // Install only essential dependencies
  console.log('📥 Installing client dependencies with minimal memory...');
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
  
  // Verify vite is installed
  console.log('🔍 Verifying vite installation...');
  const vitePath = path.join(__dirname, 'client', 'node_modules', 'vite');
  if (!fs.existsSync(vitePath)) {
    throw new Error('Vite not found after installation');
  }
  console.log('✅ Vite found');
  
  // Build with emergency memory settings
  console.log('🔨 Emergency build with minimal memory...');
  const buildEnv = { 
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=300 --optimize-for-size --gc-interval=100',
    NODE_ENV: 'production'
  };
  
  // Clear any existing build
  try {
    execSync('rm -rf dist', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  } catch (e) {
    // Ignore if dist doesn't exist
  }
  
  // Use minimal vite config
  console.log('🔧 Using emergency Vite configuration...');
  execSync('cp vite.config.minimal.js vite.config.js', { 
    cwd: path.join(__dirname, 'client'), 
    stdio: 'inherit' 
  });
  
  // Try building with even more aggressive settings
  console.log('🔨 Building with emergency memory settings...');
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
  console.log('✅ Emergency build completed');
  
  console.log('✅ Emergency build completed successfully');
  
} catch (error) {
  console.error('❌ Emergency build failed:', error.message);
  console.log('💡 Consider upgrading to Render paid plan for more memory');
  process.exit(1);
}
