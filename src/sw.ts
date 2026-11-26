/// <reference lib="webworker" />
import { range } from './lib/byteRange';

const sw = self as unknown as ServiceWorkerGlobalScope;
const cacheName = `videovault-demo-${__BUILD_ID__}`;

sw.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const paths: string[] = await (await fetch('/precache.json', { cache: 'no-store' })).json();
      const cache = await caches.open(cacheName);
      await cache.addAll(paths);
      await sw.skipWaiting();
    })()
  );
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (name.startsWith('videovault-demo-') && name !== cacheName) await caches.delete(name);
      }
      await sw.clients.claim();
    })()
  );
});

/** Demo clips are small public assets. Serve browser byte ranges from the full cached copy. */
const cachedResponse = async function (request: Request): Promise<Response> {
  const cache = await caches.open(cacheName);
  const url = new URL(request.url);
  const response = await cache.match(request.mode === 'navigate' && url.pathname === '/' ? '/index.html' : url.pathname);
  if (!response) return fetch(request);
  const header = request.headers.get('Range');
  if (!header || !url.pathname.endsWith('.mp4')) return response;
  const bytes = await response.arrayBuffer();
  try {
    const [start, end] = range(header, bytes.byteLength);
    return new Response(bytes.slice(start, end + 1), {
      status: 206,
      headers: {
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Content-Length': String(end - start + 1),
        'Content-Range': `bytes ${start}-${end}/${bytes.byteLength}`
      }
    });
  } catch {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${bytes.byteLength}` } });
  }
};

sw.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== sw.location.origin) return;
  event.respondWith(cachedResponse(event.request));
});
