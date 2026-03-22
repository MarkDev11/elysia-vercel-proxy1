export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);

  const HF_SPACE_URL = process.env.HF_SPACE_URL;
  const SECRET_PATH  = process.env.SECRET_PATH;
  const SECRET_TOKEN = process.env.SECRET_TOKEN;

  // Path dikirim sebagai query param: ?path=/bot.../getUpdates
  // Ini lebih reliable daripada catch-all routing Vercel
  const pathname = url.searchParams.get('path') || '/';

  // ── INBOUND: Telegram → Vercel → HF Space ─────────────────
  if (pathname.startsWith(SECRET_PATH)) {
    const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (secretToken !== SECRET_TOKEN) {
      return new Response('Forbidden', { status: 403 });
    }
    const hfUrl = HF_SPACE_URL + pathname;
    return fetch(hfUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }

  // ── OUTBOUND: HF → Vercel → Telegram API ──────────────────
  if (pathname.startsWith('/bot') || pathname.startsWith('/file/bot')) {
    // Rebuild query string tanpa 'path' param
    const tgParams = new URLSearchParams(url.search);
    tgParams.delete('path');
    const qs = tgParams.toString() ? '?' + tgParams.toString() : '';
    const tgUrl = 'https://api.telegram.org' + pathname + qs;
    return fetch(tgUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }

  return new Response('Not Found. Use ?path=/bot.../method or ?path=' + SECRET_PATH, { status: 404 });
}
