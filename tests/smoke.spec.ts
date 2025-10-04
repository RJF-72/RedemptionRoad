import { test, expect, type Page, type Route } from '@playwright/test';

const pages = [
  { path: '/index.html', check: async ({ page }: { page: Page }) => {
      await expect(page.locator('text=SOTA')).toBeVisible({ timeout: 5000 });
    } },
  { path: '/daw.html', check: async ({ page }: { page: Page }) => {
      await expect(page.locator('text=Import')).toBeVisible({ timeout: 5000 });
    } },
  { path: '/SOTA_Professional_Synthesizer.html', check: async ({ page }: { page: Page }) => {
      await expect(page.locator('text=Synth')).toBeVisible({ timeout: 5000 });
    } },
  { path: '/SOTA_Music_Video_Generator.html', check: async ({ page }: { page: Page }) => {
      await expect(page.locator('text=Generate')).toBeVisible({ timeout: 5000 });
    } },
  { path: '/SIVideoGenerator.html', check: async ({ page }: { page: Page }) => {
      await expect(page.locator('canvas')).toHaveCount(1, { timeout: 5000 });
    } },
  { path: '/SOTA_Marketing_Video_Creator.html', check: async ({ page }: { page: Page }) => {
      await expect(page.locator('text=Generate')).toBeVisible({ timeout: 5000 });
    } },
  { path: '/SOTA_Script_To_Video_Engine.html', check: async ({ page }: { page: Page }) => {
      await expect(page.locator('text=Generate')).toBeVisible({ timeout: 5000 });
    } },
  { path: '/SOTA_Audio_Authenticity.html', check: async ({ page }: { page: Page }) => {
      await expect(page.locator('text=Authenticity')).toBeVisible({ timeout: 5000 });
    } },
  { path: '/SOTA_Songwriter.html', check: async ({ page }: { page: Page }) => {
      await expect(page.locator('text=Songwriter')).toBeVisible({ timeout: 5000 });
    } },
];

// Mock backend calls to avoid network flakiness
async function mockBackend(page: Page) {
  await page.route('**/api/**', async (route: Route) => {
    const url = route.request().url();
    if (url.includes('/api/generate/start')) {
      await route.fulfill({ status: 200, body: JSON.stringify({ job_id: 'test-job' }) });
    } else if (url.includes('/api/generate/status')) {
      await route.fulfill({ status: 200, body: JSON.stringify({ status: 'done', progress: 100 }) });
    } else if (url.includes('/api/generate/result')) {
      await route.fulfill({ status: 200, headers: { 'Content-Type': 'video/mp4' }, body: 'ok' });
    } else if (url.includes('/api/songwriter')) {
      await route.fulfill({ status: 200, body: JSON.stringify({ lyrics: 'Test lyrics generated.' }) });
    } else if (url.includes('/api/audio/authenticity')) {
      await route.fulfill({ status: 200, body: JSON.stringify({ authenticity_percent: 87.5 }) });
    } else if (url.includes('/api/health')) {
      await route.fulfill({ status: 200, body: JSON.stringify({ status: 'ok' }) });
    } else {
      await route.continue();
    }
  });
}

for (const p of pages) {
  test(`smoke: ${p.path}`, async ({ page, baseURL }) => {
    await mockBackend(page);
    await page.goto(baseURL! + p.path);
    await p.check({ page });
  });
}
