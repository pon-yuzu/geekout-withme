/**
 * Google Calendar API helper using Service Account (JWT auth).
 * Environment variables: GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_CALENDAR_ID
 *
 * Uses plain fetch (no Google client library) for Cloudflare Workers compatibility.
 */

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

interface FreeBusyPeriod {
  start: string;
  end: string;
}

interface CalendarEventResult {
  id: string;
  htmlLink: string;
}

function getGoogleCredentials(locals: any): { serviceAccount: ServiceAccountKey; calendarId: string } | null {
  const runtime = locals?.runtime;
  const json = runtime?.env?.GOOGLE_SERVICE_ACCOUNT_JSON || import.meta.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const calendarId = runtime?.env?.GOOGLE_CALENDAR_ID || import.meta.env.GOOGLE_CALENDAR_ID;

  if (!json || !calendarId) return null;

  try {
    const serviceAccount = typeof json === 'string' ? JSON.parse(json) : json;
    return { serviceAccount, calendarId };
  } catch {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON');
    return null;
  }
}

// --- JWT / Token helpers ---

function base64url(input: string | ArrayBuffer): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN .*-----/, '')
    .replace(/-----END .*-----/, '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function createSignedJWT(serviceAccount: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: serviceAccount.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const unsigned = `${headerB64}.${payloadB64}`;

  const keyData = pemToArrayBuffer(serviceAccount.private_key);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(unsigned));
  return `${unsigned}.${base64url(signature)}`;
}

async function getAccessToken(serviceAccount: ServiceAccountKey): Promise<string> {
  const jwt = await createSignedJWT(serviceAccount);
  const tokenUri = serviceAccount.token_uri || 'https://oauth2.googleapis.com/token';

  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google OAuth failed (${res.status}): ${text}`);
  }

  const data = await res.json() as any;
  return data.access_token;
}

// --- Public API ---

/**
 * Check if Google Calendar integration is configured.
 */
export function isGoogleCalendarConfigured(locals: any): boolean {
  return getGoogleCredentials(locals) !== null;
}

/**
 * Get busy time periods from Google Calendar.
 * Returns an array of { start, end } ISO strings.
 */
export async function getFreeBusy(
  locals: any,
  timeMin: string,
  timeMax: string,
): Promise<FreeBusyPeriod[]> {
  const creds = getGoogleCredentials(locals);
  if (!creds) return [];

  const token = await getAccessToken(creds.serviceAccount);

  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: creds.calendarId }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Google FreeBusy failed (${res.status}): ${text}`);
    return [];
  }

  const data = await res.json() as any;
  const calendar = data.calendars?.[creds.calendarId];
  return calendar?.busy || [];
}

/**
 * Create a Google Calendar event. Returns the event ID.
 */
export async function createCalendarEvent(
  locals: any,
  params: {
    summary: string;
    startTime: string;
    endTime: string;
    description?: string;
    attendeeEmail?: string;
  },
): Promise<CalendarEventResult> {
  const creds = getGoogleCredentials(locals);
  if (!creds) throw new Error('Google Calendar not configured');

  const token = await getAccessToken(creds.serviceAccount);

  const event: any = {
    summary: params.summary,
    start: { dateTime: params.startTime, timeZone: 'UTC' },
    end: { dateTime: params.endTime, timeZone: 'UTC' },
  };
  if (params.description) event.description = params.description;
  if (params.attendeeEmail) {
    event.attendees = [{ email: params.attendeeEmail }];
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(creds.calendarId)}/events?sendUpdates=none`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Calendar event creation failed (${res.status}): ${text}`);
  }

  const data = await res.json() as any;
  return { id: data.id, htmlLink: data.htmlLink };
}

/**
 * Delete a Google Calendar event.
 */
export async function deleteCalendarEvent(locals: any, eventId: string): Promise<void> {
  const creds = getGoogleCredentials(locals);
  if (!creds) return;

  const token = await getAccessToken(creds.serviceAccount);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(creds.calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  // 204 = success, 404/410 = already deleted — both fine
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    console.error(`Google Calendar event deletion failed (${res.status})`);
  }
}
