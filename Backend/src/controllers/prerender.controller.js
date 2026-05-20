import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import asyncHandler from '../utils/asyncHandler.js';

const cache = new Map();
const CACHE_TTL = 3600000; // 1 hora

export const prerenderPage = asyncHandler(async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL missing');

  // Verificação de Cache
  const cached = cache.get(targetUrl);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log(`[Prerender] Serving from cache: ${targetUrl}`);
    return res.send(cached.html);
  }

  let browser = null;
  try {
    console.log(`[Prerender] Rendering URL: ${targetUrl}`);
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    // 'networkidle0' é crucial: espera até que não haja mais de 0 conexões de rede por 500ms.
    // Isso garante que o React terminou de carregar os dados das suas APIs (Supabase).
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    const html = await page.content();
    
    cache.set(targetUrl, { html, timestamp: Date.now() });
    res.send(html);
  } catch (error) {
    console.error(`[Prerender Error] ${error.message}`);
    res.status(500).send(`Failed to prerender: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
});