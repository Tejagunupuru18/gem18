// Test environment variables
console.log('🔧 Environment Variables Test');
console.log('============================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');

// Test file system
const fs = require('fs');
const path = require('path');

console.log('\n📁 File System Check');
console.log('====================');
const buildPath = path.join(__dirname, 'client/build');
const indexPath = path.join(buildPath, 'index.html');

console.log('Build directory exists:', fs.existsSync(buildPath));
console.log('index.html exists:', fs.existsSync(indexPath));

if (fs.existsSync(buildPath)) {
  console.log('Build directory contents:', fs.readdirSync(buildPath));
}

console.log('\n🎯 Expected Behavior:');
console.log('- NODE_ENV should be "production"');
console.log('- Build directory should exist');
console.log('- index.html should exist in client/build/'); 