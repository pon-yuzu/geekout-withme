/**
 * Zoom Server-to-Server OAuth API helper.
 * Environment variables: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET
 */

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ZoomMeetingResult {
  join_url: string;
  meeting_id: number;
}

function getZoomCredentials(locals: any) {
  const runtime = locals?.runtime;
  return {
    accountId: runtime?.env?.ZOOM_ACCOUNT_ID || import.meta.env.ZOOM_ACCOUNT_ID || '',
    clientId: runtime?.env?.ZOOM_CLIENT_ID || import.meta.env.ZOOM_CLIENT_ID || '',
    clientSecret: runtime?.env?.ZOOM_CLIENT_SECRET || import.meta.env.ZOOM_CLIENT_SECRET || '',
  };
}

async function getAccessToken(clientId: string, clientSecret: string, accountId: string): Promise<string> {
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zoom OAuth failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as ZoomTokenResponse;
  return data.access_token;
}

/**
 * Create a scheduled Zoom meeting.
 */
export async function createZoomMeeting(
  locals: any,
  topic: string,
  startTime: string,
  durationMinutes: number
): Promise<ZoomMeetingResult> {
  const { accountId, clientId, clientSecret } = getZoomCredentials(locals);
  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom credentials not configured');
  }

  const token = await getAccessToken(clientId, clientSecret, accountId);

  const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration: durationMinutes,
      timezone: 'UTC',
      settings: {
        waiting_room: true,
        join_before_host: false,
        mute_upon_entry: true,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zoom meeting creation failed (${res.status}): ${text}`);
  }

  const data = await res.json() as any;
  return {
    join_url: data.join_url,
    meeting_id: data.id,
  };
}

/**
 * Delete a Zoom meeting.
 */
export async function deleteZoomMeeting(locals: any, meetingId: string | number): Promise<void> {
  const { accountId, clientId, clientSecret } = getZoomCredentials(locals);
  if (!accountId || !clientId || !clientSecret) return; // Skip if not configured

  const token = await getAccessToken(clientId, clientSecret, accountId);

  const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  // 204 = success, 404 = already deleted — both are fine
  if (!res.ok && res.status !== 404) {
    console.error(`Zoom meeting deletion failed (${res.status})`);
  }
}
