// CF Pages Function: /api/latest-videos
// Reads the public YouTube RSS for @homemuscle (channel UC_wpxaGIpyBNV3BLjhfBgTw),
// returns the latest full episode + latest Short. No API key. Edge-cached 30 min.
const CHANNEL_ID = 'UC_wpxaGIpyBNV3BLjhfBgTw';

export async function onRequest() {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, {
      headers: { 'user-agent': 'Mozilla/5.0' },
      cf: { cacheTtl: 1800, cacheEverything: true },
    });
    if (!res.ok) throw new Error('feed ' + res.status);
    const xml = await res.text();
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
      const b = m[1];
      const id = (b.match(/<yt:videoId>([^<]+)/) || [])[1] || '';
      const title = (b.match(/<title>([^<]+)/) || [])[1] || '';
      return { id, title };
    });
    const isShort = (t) => /#shorts?\b/i.test(t);
    const clean = (t) => t.replace(/#shorts?\b/gi, '').trim();
    const epRaw = entries.find((e) => !isShort(e.title)) || entries[0] || null;
    const shRaw = entries.find((e) => isShort(e.title)) || null;
    const episode = epRaw ? { id: epRaw.id, title: clean(epRaw.title) } : null;
    const short = shRaw ? { id: shRaw.id, title: clean(shRaw.title) } : null;
    return new Response(JSON.stringify({ episode, short }), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=1800',
        'access-control-allow-origin': '*',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
