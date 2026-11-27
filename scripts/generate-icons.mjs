// Renders public/icons/icon.svg to the PNG sizes referenced by public/manifest.json.
// Usage: node scripts/generate-icons.mjs   (requires `npx playwright install chromium`)
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const iconsDir = fileURLToPath(new URL('../public/icons/', import.meta.url));
const svg = await readFile(`${iconsDir}icon.svg`, 'utf8');
const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const targets = [
  { file: 'icon-192.png', size: 192, padding: 0 },
  { file: 'icon-512.png', size: 512, padding: 0 },
  // Maskable icons need the artwork inside the central 80% safe zone.
  { file: 'icon-maskable-512.png', size: 512, padding: 0.12 },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { file, size, padding } of targets) {
  const inner = Math.round(size * (1 - 2 * padding));
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<body style="margin:0;background:#0f172a;display:grid;place-items:center;height:${size}px">
       <img src="${dataUrl}" width="${inner}" height="${inner}">
     </body>`,
  );
  await page.screenshot({ path: `${iconsDir}${file}`, omitBackground: false });
  console.log(`wrote ${file}`);
}
await browser.close();
