#!/usr/bin/env node

// Memory-optimized build script for client
const { execSync } = require('child_process');
const path = require('path');

console.log('🔨 Starting memory-optimized client build...');

try {
  // Set memory-optimized environment
  const buildEnv = {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=4096 --optimize-for-size',
    NODE_ENV: 'production'
  };

  // Clear any existing build
  console.log('🧹 Cleaning previous build...');
  try {
    execSync('rm -rf dist', { stdio: 'inherit' });
  } catch (e) {
    // Ignore if dist doesn't exist
  }

  // Build with memory optimization
  console.log('🔨 Building with memory optimization...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: buildEnv
  });

  console.log('✅ Memory-optimized build completed');
  
} catch (error) {
  console.error('❌ Memory-optimized build failed:', error.message);
  process.exit(1);
}
