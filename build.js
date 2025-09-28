#!/usr/bin/env node

// Build script for production deployment
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting build process...');

try {
  // Set production environment
  process.env.NODE_ENV = 'production';
  
  console.log('📦 Installing dependencies...');
  
  // Install client dependencies first
  console.log('📥 Installing client dependencies...');
  // Ensure devDependencies (like vite) are installed during Render builds
  const clientEnv = { ...process.env };
  // Render sets NODE_ENV=production for builds; force devDeps install for client
  clientEnv.npm_config_production = 'false';
  execSync('npm install --include=dev', { cwd: path.join(__dirname, 'client'), stdio: 'inherit', env: clientEnv });
  
  // Install server dependencies
  console.log('📥 Installing server dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  
  // Install root dependencies last
  console.log('📥 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Verify client dependencies
  console.log('🔍 Verifying client dependencies...');
  const clientNodeModules = path.join(__dirname, 'client', 'node_modules');
  if (!fs.existsSync(clientNodeModules)) {
    throw new Error('Client node_modules not found');
  }
  
  const vitePath = path.join(clientNodeModules, 'vite');
  if (!fs.existsSync(vitePath)) {
    throw new Error('Vite not found in client dependencies');
  }
  
  console.log('🔨 Building client...');
  // Build client
  execSync('npm run build', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  
  console.log('🔨 Building server...');
  // Build server (if needed)
  execSync('npm run build', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  
  console.log('✅ Build completed successfully');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}


