#!/usr/bin/env node

// Simple start script for production deployment
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting E-Learning Platform...');

try {
  // Set production environment
  process.env.NODE_ENV = 'production';
  
  // Change to server directory
  const serverDir = path.join(__dirname, 'server');
  process.chdir(serverDir);
  
  console.log('📁 Changed to server directory:', serverDir);
  
  // Start the server directly
  console.log('🚀 Starting server...');
  require('./server.js');
  
} catch (error) {
  console.error('❌ Start failed:', error.message);
  process.exit(1);
}
