const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileResult {
  success: boolean;
  error?: string;
}

export async function verifyTurnstile(
  token: string | undefined,
  ip: string | undefined,
  secretKey: string | undefined,
): Promise<TurnstileResult> {
  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY not configured — skipping verification');
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'Missing CAPTCHA token' };
  }

  const body = new URLSearchParams({
    secret: secretKey,
    response: token,
    ...(ip ? { remoteip: ip } : {}),
  });

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    body,
  });

  const data = await res.json() as { success: boolean; 'error-codes'?: string[] };

  if (!data.success) {
    return {
      success: false,
      error: `CAPTCHA verification failed: ${(data['error-codes'] ?? []).join(', ')}`,
    };
  }

  return { success: true };
}
