/**
 * Feature flags for temporary service control.
 * Set PUBLIC_VOICE_LOUNGE_ENABLED=true in env to re-enable for all users.
 * Set VOICE_LOUNGE_ALLOWED_USERS=id1,id2 to whitelist specific users.
 */

export function isVoiceLoungeEnabled(): boolean {
  try {
    return import.meta.env.PUBLIC_VOICE_LOUNGE_ENABLED === 'true';
  } catch {
    return false;
  }
}

export function isVoiceLoungeAllowed(userId: string | undefined, locals?: any): boolean {
  if (isVoiceLoungeEnabled()) return true;
  if (!userId) return false;
  try {
    const runtime = locals?.runtime;
    const raw = runtime?.env?.VOICE_LOUNGE_ALLOWED_USERS
      || import.meta.env.VOICE_LOUNGE_ALLOWED_USERS
      || '';
    const allowed = raw.split(',').map((s: string) => s.trim()).filter(Boolean);
    return allowed.includes(userId);
  } catch {
    return false;
  }
}
