# Deployment Guide

## Environment Variables

### Local Development

1. Copy `.env.example` to `.env`
2. Fill in each key with your actual values

### Production (Cloudflare Pages)

Set the following environment variables in Cloudflare Dashboard:

**Dashboard → Workers & Pages → geekout-withme → Settings → Variables and Secrets**

| Variable | Type | Description |
|----------|------|-------------|
| `PUBLIC_SUPABASE_URL` | Plain text | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Plain text | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Supabase service role key |
| `STRIPE_SECRET_KEY` | Secret | Stripe secret key |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Plain text | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Secret | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | Secret | Stripe Premium subscription price ID |
| `STRIPE_LINE_SUPPORT_PRICE_ID` | Secret | Stripe LINE Support subscription price ID |
| `CF_AI_TOKEN` | Secret | Cloudflare Workers AI token |
| `CF_ACCOUNT_ID` | Plain text | Cloudflare account ID |
| `RESEND_API_KEY` | Secret | Resend email API key |
| `ADMIN_EMAILS` | Secret | Comma-separated admin email addresses |
| `PUBLIC_SITE_URL` | Plain text | Production site URL |
| `PUBLIC_VOICE_LOUNGE_ENABLED` | Plain text | "true" to enable Voice Lounge |
| `VOICE_LOUNGE_ALLOWED_USERS` | Secret | Comma-separated allowed user emails |

> **Note:** `AI` and `VOICE_ROOM` are Cloudflare bindings configured in `wrangler.toml`, not environment variables.

### Deploy

```bash
npm run build && npx wrangler pages deploy dist --project-name geekout-withme --branch main
```
