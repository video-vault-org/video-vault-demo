import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// These tests use only Vite's static preview server. No API, DB or storage service is started.
test('public gallery, filters, translations, themes and read-only actions', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4321' || url.pathname.startsWith('/api/') || url.pathname === '/bootstrap' || url.pathname === '/login' || !['GET', 'HEAD'].includes(request.method())) requests.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('.video-card')).toHaveCount(3);
  await page.screenshot({ path: test.info().outputPath('gallery.png'), fullPage: true });
  await expect(page.getByRole('button', { name: /Video hinzufügen/ })).toBeDisabled();
  await expect(page.getByLabel('Passwort', { exact: true })).toHaveCount(0);
  await page.getByLabel('Kategorie', { exact: true }).selectOption('Freizeit / Leisure');
  await expect(page.locator('.video-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Zurücksetzen', exact: true }).click();
  await page.getByLabel('Videos durchsuchen', { exact: true }).fill('Wolken');
  await expect(page.locator('.video-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Zurücksetzen', exact: true }).click();
  await page.getByRole('combobox', { name: 'Design', exact: true }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Sprache wechseln' }).click();
  await expect(page.getByRole('heading', { name: 'A summer by the lake', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'A summer by the lake', exact: true })).toBeVisible();
  expect(requests).toEqual([]);
});

test('native media playback, title-based download and paginated comments', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Mehr Details', exact: true }).first().click();
  await expect.poll(() => page.locator('video').evaluate((video) => (video as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(2);
  await page.locator('video').evaluate(async (video) => {
    await (video as HTMLVideoElement).play();
  });
  await expect.poll(() => page.locator('video').evaluate((video) => (video as HTMLVideoElement).currentTime)).toBeGreaterThan(0);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Herunterladen', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('Ein Sommer am See.mp4');
  expect(await readFile((await download.path())!)).toEqual(await readFile('public/demo/lake.mp4'));
  await page.getByRole('button', { name: 'Kommentare', exact: true }).click();
  const comments = page.getByRole('dialog', { name: 'Kommentare', exact: true });
  await expect(comments.locator('.comment')).toHaveCount(2);
  await expect(comments.locator('time')).toHaveAttribute('datetime', '2026-08-12T12:10:00Z');
  await comments.getByRole('button', { name: 'Weitere Kommentare laden', exact: true }).click();
  await expect(comments.locator('.comment')).toHaveCount(4);
  await expect(comments.getByText('Gelöscht', { exact: true })).toBeVisible();
  await expect(comments.getByRole('button', { name: 'Speichern', exact: true })).toBeDisabled();
  expect(errors).toEqual([]);
});

test('static offline shell and cached video byte ranges', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  const part = await page.evaluate(async () => {
    const response = await fetch('/demo/lake.mp4', { headers: { Range: 'bytes=10-19' } });
    return { status: response.status, range: response.headers.get('Content-Range'), bytes: Array.from(new Uint8Array(await response.arrayBuffer())) };
  });
  expect(part.status).toBe(206);
  expect(part.range).toMatch(/^bytes 10-19\//);
  expect(Buffer.from(part.bytes)).toEqual((await readFile('public/demo/lake.mp4')).subarray(10, 20));
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.video-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Mehr Details', exact: true }).first().click();
  await expect.poll(() => page.locator('video').evaluate((video) => (video as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(2);
});

test('mobile layout and local media assets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.video-card')).toHaveCount(3);
  await expect.poll(() => page.locator('.thumbnail-frame img').evaluateAll((images) => images.every((image) => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
