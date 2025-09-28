const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting build process...');

try {
  // Check if we're in production or if NODE_ENV is not set (default to production for deployment)
  const isProduction = process.env.NODE_ENV === 'production' || !process.env.NODE_ENV;
  
  if (isProduction) {
    console.log('📦 Building client for production...');
    
    // Change to client directory and build
    const clientDir = path.join(__dirname, '..', 'client');
    
    // Check if client directory exists
    if (!fs.existsSync(clientDir)) {
      console.error('❌ Client directory not found at:', clientDir);
      process.exit(1);
    }
    
    // Install client dependencies if node_modules doesn't exist
    const clientNodeModules = path.join(clientDir, 'node_modules');
    if (!fs.existsSync(clientNodeModules)) {
      console.log('📥 Installing client dependencies...');
      // Force install devDependencies (including vite) even in production
      const clientEnv = { ...process.env };
      clientEnv.npm_config_production = 'false';
      execSync('npm install --include=dev', { cwd: clientDir, stdio: 'inherit', env: clientEnv });
    }
    
    // Verify vite is installed
    const vitePath = path.join(clientNodeModules, 'vite');
    if (!fs.existsSync(vitePath)) {
      console.error('❌ Vite not found in client dependencies');
      console.log('📥 Reinstalling client dependencies with devDependencies...');
      const clientEnv = { ...process.env };
      clientEnv.npm_config_production = 'false';
      execSync('npm install --include=dev', { cwd: clientDir, stdio: 'inherit', env: clientEnv });
    }
    
    // Build the client with increased memory limit
    console.log('🔨 Building React app...');
    const buildEnv = { 
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    };
    execSync('npm run build', { cwd: clientDir, stdio: 'inherit', env: buildEnv });
    
    // Verify build output
    const distPath = path.join(clientDir, 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      console.error('❌ Build failed - index.html not found at:', indexPath);
      process.exit(1);
    }
    
    console.log('✅ Client build completed successfully');
  } else {
    console.log('🔧 Development mode - skipping client build');
  }
  
  // If running in a build phase (Render build), do not start the server
  const inRenderBuild = process.env.RENDER === 'true' || process.env.CI === 'true';
  if (inRenderBuild) {
    console.log('🏗️ Detected build environment; skipping server start.');
    process.exit(0);
  }
  
  // Start the server in runtime
  console.log('🚀 Starting server...');
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
  require('./server.js');
  
} catch (error) {
  console.error('❌ Build process failed:', error.message);
  process.exit(1);
}
