# Elysia Vercel Proxy (Plan B)

Backup proxy untuk Cloudflare Tunnel jika terjadi gangguan.

## Cara Deploy ke Vercel

### 1. Push ke GitHub (Public)
Repository ini sudah di-push ke GitHub sebagai backup.

### 2. Setup Environment Variables di Vercel

Masuk ke https://vercel.com dan import repository ini.

Tambahkan Environment Variables:

| Variable | Value |
|----------|-------|
| HF_SPACE_URL | https://mark421-zeroclaw.hf.space |
| SECRET_PATH | /wh-rahasia-zeroclaw-2026 |
| SECRET_TOKEN | (bebas, samakan dengan Cloudflare) |

### 3. Deploy

Klik Deploy! Vercel akan memberikan URL seperti:
`https://elysia-vercel-proxy.vercel.app`

## Struktur

```
vercel-proxy/
├── api/
│   └── index.js      # Edge Function
├── package.json
└── README.md
```

## Catatan

- Menggunakan Edge Runtime untuk kecepatan maksimal
- Jika Cloudflare bermasalah, ubah webhook URL ke Vercel
