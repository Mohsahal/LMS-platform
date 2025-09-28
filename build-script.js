#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Running pre-build cleanup...');

// Remove problematic directories that cause tar conflicts
const problematicPaths = [
  'server/node_modules/typedarray/test/server',
  'client/node_modules/typedarray/test/server'
];

problematicPaths.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`🗑️  Removing problematic directory: ${dir}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

console.log('✅ Pre-build cleanup completed');
