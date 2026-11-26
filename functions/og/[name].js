// CF Pages Function: /og/home.jpg, the homepage share image.
// On a holiday date (Pacific time) it serves that day's greeting card, every other day the
// standing card. No redeploy is needed to switch back. Short cache so previews flip on time.
// Note: Facebook and LinkedIn cache the image they fetched, so a share made on the holiday
// can keep the holiday card there until it is re-scraped.
const HOLIDAYS = { '2026-11-26': '/img/og-thanks-2026.jpg' };
const DEFAULT = '/img/og-home-2026.jpg';

export async function onRequest({ request, params, env }) {
  if (params.name !== 'home.jpg') return new Response('Not found', { status: 404 });
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
  const path = HOLIDAYS[today] || DEFAULT;
  const asset = await env.ASSETS.fetch(new URL(path, request.url));
  const headers = new Headers(asset.headers);
  headers.set('content-type', 'image/jpeg');
  headers.set('cache-control', 'public, max-age=600');
  return new Response(asset.body, { status: asset.status, headers });
}
