const { test, expect } = require('@playwright/test');

const pages = [
  { path: '/index.html', check: async (page) => {
      await expect(page).toHaveTitle(/SOTA/i);
    } },
  { path: '/daw.html', check: async (page) => {
      await expect(page.locator('#projectImportInput')).toHaveCount(1, { timeout: 5000 });
    } },
  { path: '/advanced-composer.html', check: async (page) => {
      // Advanced Composer mounts a React app into #root and exposes an Export button (footer helper)
      await expect(page.locator('#root')).toHaveCount(1, { timeout: 5000 });
      const footer = page.locator('div[style*="position:fixed"][style*="bottom:16px"]');
      await expect(footer.getByRole('button', { name: /Export Parts MIDI/i })).toBeVisible({ timeout: 5000 });
    } },
  { path: '/SOTA_Music_Video_Generator.html', check: async (page) => {
      await expect(page.getByRole('button', { name: /Generate Video/i })).toBeVisible({ timeout: 5000 });
    } },
  { path: '/SIVideoGenerator.html', check: async (page) => {
      await expect(page.locator('canvas')).toHaveCount(1, { timeout: 5000 });
    } },
  { path: '/SOTA_Marketing_Video_Creator.html', check: async (page) => {
      await expect(page.getByRole('button', { name: /Generate/i })).toBeVisible({ timeout: 5000 });
    } },
  { path: '/SOTA_Script_To_Video_Engine.html', check: async (page) => {
      await expect(page.getByRole('button', { name: /Generate Video/i })).toBeVisible({ timeout: 5000 });
    } },
  { path: '/SOTA_Audio_Authenticity.html', check: async (page) => {
      await expect(page.getByRole('heading', { name: /Audio Authenticity/i })).toBeVisible({ timeout: 5000 });
    } },
  { path: '/SOTA_Songwriter.html', check: async (page) => {
      await expect(page.getByRole('heading', { name: /Songwriter/i })).toBeVisible({ timeout: 5000 });
    } },
];

async function mockBackend(page) {
  await page.route('**/api/**', async route => {
    const url = route.request().url();
    if (url.includes('/api/generate/start')) {
      await route.fulfill({ status: 200, body: JSON.stringify({ job_id: 'test-job' }) });
    } else if (url.includes('/api/generate/status')) {
      await route.fulfill({ status: 200, body: JSON.stringify({ status: 'done', progress: 100 }) });
    } else if (url.includes('/api/generate/result')) {
      const data = Buffer.from('fake');
      await route.fulfill({ status: 200, headers: { 'Content-Type': 'video/mp4' }, body: data });
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
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      errors.push(String(err));
    });
    await page.goto(baseURL + p.path);
    await p.check(page);
    // Assert no console/page errors
    expect(errors, `Console errors on ${p.path}:\n${errors.join('\n')}`).toEqual([]);
  });
}
