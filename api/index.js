export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  
  // Environment Variables from Vercel
  const HF_SPACE_URL = process.env.HF_SPACE_URL;
  const SECRET_PATH = process.env.SECRET_PATH;
  const SECRET_TOKEN = process.env.SECRET_TOKEN;

  // 1. INBOUND: Telegram -> Vercel -> Hugging Face
  if (url.pathname.startsWith(SECRET_PATH)) {
    const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (secretToken !== SECRET_TOKEN) {
      return new Response('Access Denied: Invalid Token', { status: 403 });
    }

    const hfUrl = HF_SPACE_URL + url.pathname + url.search;
    return fetch(hfUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
  }

  // 2. OUTBOUND: Hugging Face -> Vercel -> Telegram API
  if (url.pathname.startsWith('/bot') || url.pathname.startsWith('/file/bot')) {
    const tgUrl = 'https://api.telegram.org' + url.pathname + url.search;
    return fetch(tgUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
  }

  return new Response('Endpoint Not Found', { status: 404 });
}
