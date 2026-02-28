export function isAdmin(email: string | undefined, locals: any): boolean {
  if (!email) return false;
  const runtime = locals.runtime;
  const adminEmails = (runtime?.env?.ADMIN_EMAILS || import.meta.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}
