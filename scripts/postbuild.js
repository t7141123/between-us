/**
 * Post-build script for web distribution.
 * Injects favicon, PWA manifest, service worker registration, and brand meta tags into dist/index.html.
 */
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

// Copy public assets (manifest.json, sw.js, icon.png, favicon.ico, _redirects) to dist
const filesToCopy = ['manifest.json', 'sw.js', 'icon.png', 'favicon.ico', '_redirects'];
for (const file of filesToCopy) {
  const src = path.join(publicDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // Insert PWA & Open Graph meta tags before </head>
  const metaTags = `
    <link rel="icon" type="image/png" href="/icon.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/icon.png" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="canonical" href="https://between-us.ark-studio.app/" />
    <meta name="theme-color" content="#FAF7F2" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="在我們之間" />
    <meta name="description" content="在我們之間 · 雙人對話沙龍：700 個問題、7 個主題，抽卡、翻面、好好說話。" />
    <meta property="og:title" content="在我們之間 · Between Us" />
    <meta property="og:description" content="為親密關係設計的 700 道深度對話卡牌" />
    <meta property="og:image" content="/icon.png" />
    <meta property="og:url" content="https://between-us.ark-studio.app/" />
    <meta property="og:site_name" content="在我們之間 · Between Us" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="https://between-us.ark-studio.app/" />
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(() => {});
        });
      }
    </script>
  </head>`;

  if (!html.includes('rel="manifest"')) {
    html = html.replace('</head>', metaTags);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('✓ Successfully injected PWA assets & meta tags into dist/index.html');
  }
}
