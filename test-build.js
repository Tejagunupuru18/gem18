const fs = require('fs');
const path = require('path');

console.log('🔧 Testing build process...\n');

// Check current directory
console.log('📁 Current directory:', process.cwd());

// Check if client directory exists
const clientPath = path.join(__dirname, 'client');
console.log('📁 Client directory exists:', fs.existsSync(clientPath));

// Check if client/package.json exists
const clientPackagePath = path.join(clientPath, 'package.json');
console.log('📄 Client package.json exists:', fs.existsSync(clientPackagePath));

// Check if build directory exists
const buildPath = path.join(clientPath, 'build');
console.log('📁 Build directory exists:', fs.existsSync(buildPath));

// Check if index.html exists
const indexPath = path.join(buildPath, 'index.html');
console.log('📄 index.html exists:', fs.existsSync(indexPath));

// List build directory contents if it exists
if (fs.existsSync(buildPath)) {
  console.log('📋 Build directory contents:');
  const files = fs.readdirSync(buildPath);
  files.forEach(file => {
    const filePath = path.join(buildPath, file);
    const stats = fs.statSync(filePath);
    console.log(`  - ${file} (${stats.isDirectory() ? 'dir' : 'file'})`);
  });
} else {
  console.log('❌ Build directory does not exist!');
}

console.log('\n🎯 Expected: Build directory should exist with index.html'); 