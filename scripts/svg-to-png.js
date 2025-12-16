const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function run() {
  const svgPath = path.resolve(__dirname, '..', 'assets', 'screenshot.svg');
  const outPath = path.resolve(__dirname, '..', 'assets', 'screenshot.png');
  if (!fs.existsSync(svgPath)) {
    console.error('SVG not found:', svgPath);
    process.exit(2);
  }
  const svg = fs.readFileSync(svgPath, 'utf8');
  const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    // set viewport reasonably for the screenshot
    await page.setViewport({ width: 960, height: 540, deviceScaleFactor: 1 });
    await page.goto(dataUrl, { waitUntil: 'networkidle0' });
    // wait a tick for fonts/styles (compatible fallback)
    await new Promise((resolve) => setTimeout(resolve, 200));
    await page.screenshot({ path: outPath, omitBackground: true, type: 'png' });
    console.log('Wrote', outPath);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
