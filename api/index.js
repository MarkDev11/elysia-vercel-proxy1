export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);

  // Environment Variables dari Vercel Dashboard
  const HF_SPACE_URL = process.env.HF_SPACE_URL;   // https://mark421-zeroclaw.hf.space
  const SECRET_PATH  = process.env.SECRET_PATH;    // /wh-rahasia-zeroclaw-2026
  const SECRET_TOKEN = process.env.SECRET_TOKEN;   // TokenRahasiaAnda123!

  // ── FIX: Strip prefix /api karena file ini di-mount Vercel di /api/* ──
  // url.pathname saat dipanggil = /api/wh-... atau /api/bot/...
  // Kita strip /api agar routing bisa dibandingkan dengan benar
  const pathname = url.pathname.replace(/^\/api/, '') || '/';

  // ── 1. INBOUND: Telegram → Vercel → Hugging Face ─────────────
  // Telegram hit: https://elysia-vercel-proxy1.vercel.app/api/wh-rahasia-zeroclaw-2026
  // pathname setelah strip → /wh-rahasia-zeroclaw-2026  ✅ match SECRET_PATH
  if (pathname.startsWith(SECRET_PATH)) {
    const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (secretToken !== SECRET_TOKEN) {
      return new Response('Access Denied: Invalid Token', { status: 403 });
    }

    // FIX: Forward ke /webhook (endpoint ZeroClaw), bukan ke url.pathname
    // ZeroClaw menerima update Telegram di /webhook, bukan di secret path
    const hfUrl = HF_SPACE_URL + '/webhook';
    return fetch(hfUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }

  // ── 2. OUTBOUND: Hugging Face → Vercel → Telegram API ────────
  // ZeroClaw memanggil: https://elysia-vercel-proxy1.vercel.app/api/bot<TOKEN>/sendMessage
  // pathname setelah strip → /bot<TOKEN>/sendMessage  ✅ match
  if (pathname.startsWith('/bot') || pathname.startsWith('/file/bot')) {
    const tgUrl = 'https://api.telegram.org' + pathname + url.search;
    return fetch(tgUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }

  return new Response('Endpoint Not Found', { status: 404 });
}
