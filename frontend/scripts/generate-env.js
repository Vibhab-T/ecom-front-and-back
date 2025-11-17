const fs = require('fs');
const path = require('path');

// This script generates a small env.js that exposes runtime env vars
// Vercel will run this at build time so you can access API_URL in the browser
const apiUrl = process.env.API_URL || 'http://localhost:5000';
const content = `window.__ENV = { API_URL: ${JSON.stringify(apiUrl)} };`;

const outPath = path.join(__dirname, '..', 'env.js');
fs.writeFileSync(outPath, content, 'utf8');
console.log('Generated env.js with API_URL =', apiUrl);
