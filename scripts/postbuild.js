/**
 * Post-build script for web distribution.
 * Injects favicon, meta tags and brand assets into dist/index.html.
 */
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // Insert favicon and SEO / brand meta tags before </head>
  const metaTags = `
    <link rel="icon" type="image/png" href="/icon.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" href="/icon.png" />
    <meta name="theme-color" content="#FAF7F2" />
    <meta name="description" content="在我們之間 · 雙人對話沙龍：700 個問題、7 個主題，抽卡、翻面、好好說話。" />
    <meta property="og:title" content="在我們之間 · Between Us" />
    <meta property="og:description" content="為親密關係設計的 700 道深度對話卡牌" />
    <meta property="og:image" content="/icon.png" />
  </head>`;

  if (!html.includes('rel="icon"')) {
    html = html.replace('</head>', metaTags);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('✓ Successfully injected favicon & meta tags into dist/index.html');
  }
}
