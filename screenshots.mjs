import { chromium } from 'playwright';

const BASE = 'http://localhost:5173/showroom-digital-inmobiliario';
const OUT = '/Users/statick/dev/ideas/SHOWROOM_DICITAL_INMOBILIARIO/docs/screenshots';

import fs from 'fs';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const routes = [
    { path: '/', name: '01-showroom-home' },
    { path: '#showroom', name: '02-showroom-map' },
    { path: '#app', name: '03-app-proyecto' },
    { path: '#app#inicio', name: '04-app-inicio' },
    { path: '#app#ubicacion', name: '05-app-ubicacion' },
    { path: '#app#lotizacion', name: '06-app-lotizacion' },
    { path: '#app#financiamiento', name: '07-app-financiamiento' },
    { path: '#admin', name: '08-admin-dashboard' },
    { path: '#vendedor', name: '09-vendedor-dashboard' },
    { path: '#privacidad', name: '10-privacidad' },
  ];

  for (const r of routes) {
    try {
      await page.goto(`${BASE}${r.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${OUT}/${r.name}.png`, fullPage: true });
      console.log(`✓ ${r.name}.png`);
    } catch (e) {
      console.log(`✗ ${r.name}: ${e.message}`);
    }
  }

  // Mobile screenshots
  await page.setViewportSize({ width: 390, height: 844 });
  for (const r of routes.slice(0, 4)) {
    try {
      await page.goto(`${BASE}${r.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${OUT}/mobile-${r.name}.png`, fullPage: true });
      console.log(`✓ mobile-${r.name}.png`);
    } catch (e) {
      console.log(`✗ mobile-${r.name}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('\nScreenshots saved to', OUT);
}

run().catch(console.error);
