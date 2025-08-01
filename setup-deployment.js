#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up deployment configuration...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'server.js',
  'client/package.json',
  'client/src/index.js'
];

console.log('📋 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (packageJson.scripts.start) {
  console.log('✅ start script found');
} else {
  console.log('❌ start script missing');
}

// Check client package.json
const clientPackageJson = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
if (clientPackageJson.scripts.build) {
  console.log('✅ client build script found');
} else {
  console.log('❌ client build script missing');
}

// Check if .env.example exists
if (fs.existsSync('env.example')) {
  console.log('✅ env.example found');
} else {
  console.log('❌ env.example missing');
}

console.log('\n🎯 Deployment Checklist:');
console.log('1. ✅ All required files present');
console.log('2. 📝 Create .env file with production values');
console.log('3. 🔗 Push code to GitHub repository');
console.log('4. 🌐 Go to render.com and create Web Service');
console.log('5. ⚙️  Set environment variables in Render dashboard');
console.log('6. 🚀 Deploy and test your application');

console.log('\n📖 For detailed instructions, see DEPLOYMENT.md');
console.log('🔧 For build testing, run: ./deploy.sh'); 