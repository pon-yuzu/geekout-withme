/**
 * Post-build script: patches dist/_worker.js to intercept WebSocket upgrade
 * requests BEFORE they enter Astro's rendering pipeline.
 *
 * @astrojs/cloudflare v9.x cannot reliably pass Cloudflare's WebSocket 101
 * Response (with the non-standard `webSocket` property) through Astro's
 * internal rendering pipeline. This script wraps the worker's fetch handler
 * to intercept WebSocket requests and handle them directly.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const WORKER_PATH = 'dist/_worker.js';
const worker = readFileSync(WORKER_PATH, 'utf-8');

// Find the export pattern: export{VARNAME as default, ...}
const exportMatch = worker.match(/export\s*\{\s*(\w+)\s+as\s+default/);
if (!exportMatch) {
  console.error('ERROR: Could not find export pattern in _worker.js');
  process.exit(1);
}
const origVar = exportMatch[1];

const WS_HANDLER = `
// --- WebSocket Interceptor (patched by scripts/patch-worker.mjs) ---
const __origDefault = ${origVar};
const __wsDefault = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Debug endpoint — tests full WebSocket flow without actual WS
    if (url.pathname === '/api/ws-debug') {
      const SUPABASE_URL = "https://kiqxyajlfyavvcxflrkw.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXh5YWpsZnlhdnZjeGZscmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzkyMzMsImV4cCI6MjA4NjU1NTIzM30.m3Z18RlYAlInve_Jru9OsKOh2NnXb_vnSn4OquRFB2s";
      const diag = { step: 'start' };
      try {
        const cookies = __parseCookies(request.headers.get('Cookie'));
        const session = __getSupabaseSession(cookies);
        diag.sessionParsed = !!session;
        diag.sessionHasToken = !!(session && session.access_token);
        if (!session || !session.access_token) {
          diag.step = 'FAIL:cookie_parse';
          return new Response(JSON.stringify(diag, null, 2), { headers: { 'Content-Type': 'application/json' } });
        }
        const token = session.access_token;

        diag.step = 'token_verify';
        const userRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
          headers: { 'Authorization': 'Bearer ' + token, 'apikey': SUPABASE_ANON_KEY },
        });
        diag.tokenStatus = userRes.status;
        if (!userRes.ok) {
          diag.step = 'FAIL:token_verify';
          return new Response(JSON.stringify(diag, null, 2), { headers: { 'Content-Type': 'application/json' } });
        }
        const user = await userRes.json();
        diag.userId = user.id;
        diag.userName = user.user_metadata?.display_name || user.email;

        diag.step = 'premium_check';
        const subsRes = await fetch(
          SUPABASE_URL + '/rest/v1/subscriptions?user_id=eq.' + user.id + '&status=eq.active&limit=1&select=status',
          { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token } }
        );
        const subs = await subsRes.json();
        diag.subsResult = subs;
        diag.isPremium = Array.isArray(subs) && subs.length > 0;
        if (!diag.isPremium) {
          diag.step = 'FAIL:premium';
          return new Response(JSON.stringify(diag, null, 2), { headers: { 'Content-Type': 'application/json' } });
        }

        diag.step = 'room_check';
        const roomId = url.searchParams.get('roomId') || 'none';
        const roomRes = await fetch(
          SUPABASE_URL + '/rest/v1/voice_rooms?id=eq.' + roomId + '&is_active=eq.true&select=id,max_participants,participant_count&limit=1',
          { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token } }
        );
        const rooms = await roomRes.json();
        diag.roomResult = rooms;
        diag.roomFound = Array.isArray(rooms) && rooms.length > 0;

        diag.hasVoiceRoom = !!env.VOICE_ROOM;

        // Test DO connectivity (send non-WS request, expect 404 or 426)
        diag.step = 'do_test';
        const testRoomId = roomId || 'debug-test';
        try {
          const doId = env.VOICE_ROOM.idFromName(testRoomId);
          const stub = env.VOICE_ROOM.get(doId);
          const testUrl = new URL(request.url);
          testUrl.pathname = '/ws';
          const doRes = await stub.fetch(new Request(testUrl.toString(), { method: 'GET' }));
          diag.doStatus = doRes.status;
          diag.doBody = await doRes.text();
        } catch (err) {
          diag.doError = String(err);
        }

        diag.step = 'ALL_PASS';
      } catch (err) {
        diag.step = 'FAIL:exception';
        diag.error = String(err);
      }
      return new Response(JSON.stringify(diag, null, 2), { headers: { 'Content-Type': 'application/json' } });
    }

    // WebSocket goes through Astro pipeline (interceptor disabled for testing)
    return __origDefault.fetch(request, env, ctx);
  }
};

function __parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    cookies[key] = val;
  }
  return cookies;
}

function __getSupabaseSession(cookies) {
  const PREFIX = 'sb-kiqxyajlfyavvcxflrkw-auth-token';
  let raw = '';
  // Try chunked format first (.0, .1, .2, ...)
  for (let i = 0; i < 10; i++) {
    const chunk = cookies[PREFIX + '.' + i];
    if (chunk === undefined) break;
    raw += chunk;
  }
  // Fallback: single cookie (no suffix)
  if (!raw && cookies[PREFIX]) {
    raw = cookies[PREFIX];
  }
  if (!raw) return null;

  // Supabase SSR v0.8+ uses base64url encoding with "base64-" prefix
  if (raw.startsWith('base64-')) {
    try {
      const b64url = raw.slice(7);
      const b64std = b64url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64std + '='.repeat((4 - (b64std.length % 4)) % 4);
      const bin = atob(padded);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const json = new TextDecoder().decode(bytes);
      return JSON.parse(json);
    } catch {}
  }

  // Fallback: URL-encoded JSON
  try { return JSON.parse(decodeURIComponent(raw)); } catch {}
  // Fallback: raw JSON
  try { return JSON.parse(raw); } catch {}
  return null;
}

async function __handleVoiceWs(request, env, ctx, roomId) {
  const SUPABASE_URL = "https://kiqxyajlfyavvcxflrkw.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcXh5YWpsZnlhdnZjeGZscmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzkyMzMsImV4cCI6MjA4NjU1NTIzM30.m3Z18RlYAlInve_Jru9OsKOh2NnXb_vnSn4OquRFB2s";

  // --- 1. Auth ---
  const cookies = __parseCookies(request.headers.get('Cookie'));
  const session = __getSupabaseSession(cookies);
  if (!session || !session.access_token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }
  const token = session.access_token;

  // Verify token with Supabase
  const userRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { 'Authorization': 'Bearer ' + token, 'apikey': SUPABASE_ANON_KEY },
  });
  if (!userRes.ok) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }
  const user = await userRes.json();

  // --- 2. Premium check ---
  const subsRes = await fetch(
    SUPABASE_URL + '/rest/v1/subscriptions?user_id=eq.' + user.id + '&status=eq.active&limit=1&select=status',
    { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token } }
  );
  const subs = await subsRes.json();
  if (!Array.isArray(subs) || subs.length === 0) {
    return new Response(JSON.stringify({ error: 'Premium subscription required' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    });
  }

  // --- 3. Room validation ---
  const roomRes = await fetch(
    SUPABASE_URL + '/rest/v1/voice_rooms?id=eq.' + roomId + '&is_active=eq.true&select=id,max_participants,participant_count&limit=1',
    { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token } }
  );
  const rooms = await roomRes.json();
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return new Response(JSON.stringify({ error: 'Room not found or inactive' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    });
  }
  const room = rooms[0];
  if (room.participant_count >= room.max_participants) {
    return new Response(JSON.stringify({ error: 'Room is full' }), {
      status: 409, headers: { 'Content-Type': 'application/json' }
    });
  }

  // --- 4. Durable Object ---
  const voiceRoom = env.VOICE_ROOM;
  if (!voiceRoom) {
    return new Response(JSON.stringify({ error: 'Durable Objects not available' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }

  const doId = voiceRoom.idFromName(roomId);
  const stub = voiceRoom.get(doId);

  const doUrl = new URL(request.url);
  doUrl.pathname = '/ws';
  doUrl.searchParams.set('userId', user.id);
  doUrl.searchParams.set('userName', user.user_metadata?.display_name || user.email || 'Anonymous');
  doUrl.searchParams.set('maxParticipants', String(room.max_participants));
  doUrl.searchParams.set('roomId', roomId);

  // Return Durable Object response DIRECTLY — bypasses Astro pipeline completely
  return stub.fetch(new Request(doUrl.toString(), request));
}
// --- End WebSocket Interceptor ---
`;

const patched = worker.replace(
  new RegExp(`export\\s*\\{\\s*${origVar}\\s+as\\s+default`),
  WS_HANDLER + `\nexport{__wsDefault as default`
);

if (patched === worker) {
  console.error('ERROR: Replacement failed for _worker.js');
  process.exit(1);
}

writeFileSync(WORKER_PATH, patched, 'utf-8');
console.log('✓ Patched dist/_worker.js with WebSocket interceptor');
