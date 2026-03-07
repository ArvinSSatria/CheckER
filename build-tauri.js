const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const tempDir = path.join(root, '.nextjs-bundle');
const zipFile = path.join(root, 'src-tauri', 'nextjs-server.zip');

console.log('Building Next.js standalone...');
execSync('npm run build', { cwd: root, stdio: 'inherit' });

// Clean previous temp
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true });
}
fs.mkdirSync(tempDir, { recursive: true });

// Copy standalone server
const standaloneDir = path.join(root, '.next', 'standalone');
copyDirSync(standaloneDir, tempDir);

// Copy static assets
const staticSrc = path.join(root, '.next', 'static');
const staticDest = path.join(tempDir, '.next', 'static');
if (fs.existsSync(staticSrc)) {
  fs.mkdirSync(staticDest, { recursive: true });
  copyDirSync(staticSrc, staticDest);
}

// Copy public folder
const publicSrc = path.join(root, 'public');
const publicDest = path.join(tempDir, 'public');
if (fs.existsSync(publicSrc)) {
  fs.mkdirSync(publicDest, { recursive: true });
  copyDirSync(publicSrc, publicDest);
}

// Copy scraping scripts
const scriptsSrc = path.join(root, 'scripts');
const scriptsDest = path.join(tempDir, 'scripts');
if (fs.existsSync(scriptsSrc)) {
  fs.mkdirSync(scriptsDest, { recursive: true });
  copyDirSync(scriptsSrc, scriptsDest);
}

// Install puppeteer dependencies for scraping scripts in a separate temp folder
// This avoids conflicts with Next.js standalone node_modules and ensures all
// transitive dependencies (like arr-union, merge-deep, etc.) are properly resolved
console.log('Installing puppeteer dependencies for scraping scripts...');
const depsInstallDir = path.join(root, '.deps-install-temp');
if (fs.existsSync(depsInstallDir)) {
  fs.rmSync(depsInstallDir, { recursive: true });
}
fs.mkdirSync(depsInstallDir, { recursive: true });

// Create a clean package.json with only the script dependencies
fs.writeFileSync(path.join(depsInstallDir, 'package.json'), JSON.stringify({
  name: 'scraping-deps',
  private: true,
  dependencies: {
    'puppeteer-extra': '*',
    'puppeteer-extra-plugin-stealth': '*',
    'puppeteer': '*',
  }
}, null, 2));

execSync(`npm install --production --omit=dev`, {
  cwd: depsInstallDir,
  stdio: 'inherit',
  env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: 'true' },
});

// Merge installed node_modules into the bundle
const installedModules = path.join(depsInstallDir, 'node_modules');
const bundleModules = path.join(tempDir, 'node_modules');
if (fs.existsSync(installedModules)) {
  copyDirSync(installedModules, bundleModules);
}

// Clean up deps install temp
fs.rmSync(depsInstallDir, { recursive: true });

// Create zip using PowerShell (works on Windows)
console.log('Creating nextjs-server.zip...');
if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);
execSync(`powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipFile}' -Force"`, { stdio: 'inherit' });

// Clean temp
fs.rmSync(tempDir, { recursive: true });

// Create minimal out/ for frontendDist
const fallbackDir = path.join(root, 'out');
if (!fs.existsSync(fallbackDir)) {
  fs.mkdirSync(fallbackDir, { recursive: true });
}
fs.writeFileSync(path.join(fallbackDir, 'index.html'), `<!DOCTYPE html>
<html><head><meta http-equiv="refresh" content="0;url=http://localhost:3456"></head>
<body>Loading...</body></html>`);

const zipSize = (fs.statSync(zipFile).size / 1024 / 1024).toFixed(1);
console.log(`nextjs-server.zip created (${zipSize} MB)`);

// Also clean old nextjs-server folder if exists
const oldDir = path.join(root, 'src-tauri', 'nextjs-server');
if (fs.existsSync(oldDir)) {
  fs.rmSync(oldDir, { recursive: true });
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
