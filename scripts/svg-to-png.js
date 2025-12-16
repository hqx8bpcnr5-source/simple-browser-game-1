const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function run() {
  const svgPath = path.resolve(__dirname, '..', 'assets', 'screenshot.svg');
  if (!fs.existsSync(svgPath)) {
    console.error('SVG not found:', svgPath);
    process.exit(2);
  }
  const svg = fs.readFileSync(svgPath, 'utf8');
  const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

  // sizes can be passed as CLI args like 800x450 960x540
  const sizes = process.argv.slice(2).length
    ? process.argv.slice(2)
    : (process.env.SIZES || '800x450,960x540').split(',');

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    for (const s of sizes) {
      const [wStr, hStr] = s.split('x');
      const w = parseInt(wStr, 10) || 960;
      const h = parseInt(hStr, 10) || 540;
      await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
      await page.goto(dataUrl, { waitUntil: 'networkidle0' });
      await new Promise((resolve) => setTimeout(resolve, 200));
      const outPath = path.resolve(__dirname, '..', 'assets', `screenshot-${w}x${h}.png`);
      await page.screenshot({ path: outPath, omitBackground: true, type: 'png' });
      console.log('Wrote', outPath);
    }
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
