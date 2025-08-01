const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build process...\n');

// Check current directory
console.log('📁 Current directory:', process.cwd());
console.log('📁 Directory contents:', fs.readdirSync('.'));

// Check client directory
const clientPath = path.join(__dirname, 'client');
if (fs.existsSync(clientPath)) {
  console.log('✅ Client directory exists');
  console.log('📁 Client directory contents:', fs.readdirSync(clientPath));
  
  // Check build directory
  const buildPath = path.join(clientPath, 'build');
  if (fs.existsSync(buildPath)) {
    console.log('✅ Build directory exists');
    console.log('📁 Build directory contents:', fs.readdirSync(buildPath));
    
    // Check index.html
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('✅ index.html exists');
      console.log('📄 index.html size:', fs.statSync(indexPath).size, 'bytes');
    } else {
      console.log('❌ index.html not found');
    }
  } else {
    console.log('❌ Build directory not found');
  }
} else {
  console.log('❌ Client directory not found');
}

console.log('\n🎯 Build verification completed!'); 