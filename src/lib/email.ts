/**
 * Booking email notifications using Resend.
 */
import { Resend } from 'resend';

const FROM = 'Uchiwai <noreply@uchiwai.app>';
const ADMIN_EMAIL = 'ponglish.yukarizu@gmail.com';

function getResendClient(locals: any): Resend | null {
  const runtime = locals?.runtime;
  const apiKey = runtime?.env?.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDateTimeAEST(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateTimeJST(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

interface BookingEmailOpts {
  to: string;
  userName: string;
  slotStart: string;
  slotEnd: string;
  durationMinutes: number;
  zoomUrl?: string | null;
  notes?: string | null;
  bookingId: string;
}

/**
 * Send booking confirmation email to user + admin notification.
 */
export async function sendBookingConfirmation(locals: any, opts: BookingEmailOpts): Promise<void> {
  const resend = getResendClient(locals);
  if (!resend) {
    console.error('Resend not configured, skipping confirmation email');
    return;
  }

  const { to, userName, slotStart, slotEnd, durationMinutes, zoomUrl, notes, bookingId } = opts;
  const dateAEST = formatDateTimeAEST(slotStart);
  const dateJST = formatDateTimeJST(slotStart);
  const endAEST = formatDateTimeAEST(slotEnd);

  const cancelUrl = `https://uchiwai.app/my-bookings`;

  // User email
  await resend.emails.send({
    from: FROM,
    to,
    subject: '【GOWM】予約が確定しました / Booking Confirmed',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f97316;">予約確定 / Booking Confirmed</h2>
        <p>${escapeHtml(userName)} さん</p>
        <p>以下の日時で予約が確定しました。</p>

        <div style="background: #fff7ed; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>日時 (AEST):</strong> ${dateAEST}</p>
          <p style="margin: 4px 0;"><strong>日時 (JST):</strong> ${dateJST}</p>
          <p style="margin: 4px 0;"><strong>時間:</strong> ${durationMinutes}分</p>
          ${zoomUrl ? `<p style="margin: 8px 0;"><strong>Zoom:</strong> <a href="${escapeHtml(zoomUrl)}" style="color: #2563eb;">${escapeHtml(zoomUrl)}</a></p>` : ''}
          ${notes ? `<p style="margin: 4px 0;"><strong>備考:</strong> ${escapeHtml(notes)}</p>` : ''}
        </div>

        <p>
          <a href="${cancelUrl}" style="color: #f97316;">予約の確認・キャンセルはこちら</a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">※ 開始24時間前までキャンセル可能です</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">Uchiwai</p>
      </div>
    `,
  });

  // Admin notification
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `[New Booking] ${userName} — ${dateAEST}`,
    html: `
      <h3>New Booking</h3>
      <p><strong>Student:</strong> ${escapeHtml(userName)} (${escapeHtml(to)})</p>
      <p><strong>Date (AEST):</strong> ${dateAEST} — ${endAEST}</p>
      <p><strong>Duration:</strong> ${durationMinutes} min</p>
      ${zoomUrl ? `<p><strong>Zoom:</strong> <a href="${escapeHtml(zoomUrl)}">${escapeHtml(zoomUrl)}</a></p>` : ''}
      ${notes ? `<p><strong>Notes:</strong> ${escapeHtml(notes)}</p>` : ''}
      <p><strong>Booking ID:</strong> ${bookingId}</p>
    `,
  });
}

/**
 * Send reminder email.
 */
export async function sendBookingReminder(
  locals: any,
  opts: BookingEmailOpts & { reminderType: '24h' | '1h' }
): Promise<void> {
  const resend = getResendClient(locals);
  if (!resend) return;

  const { to, userName, slotStart, durationMinutes, zoomUrl, notes, reminderType } = opts;
  const dateAEST = formatDateTimeAEST(slotStart);
  const dateJST = formatDateTimeJST(slotStart);

  const subjectPrefix = reminderType === '24h' ? '明日' : 'まもなく';
  const subjectEn = reminderType === '24h' ? 'Tomorrow' : 'Starting Soon';

  await resend.emails.send({
    from: FROM,
    to,
    subject: `【GOWM】${subjectPrefix}のセッション / ${subjectEn}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f97316;">${subjectPrefix}のセッションのリマインダー</h2>
        <p>${escapeHtml(userName)} さん</p>

        <div style="background: #fff7ed; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>日時 (AEST):</strong> ${dateAEST}</p>
          <p style="margin: 4px 0;"><strong>日時 (JST):</strong> ${dateJST}</p>
          <p style="margin: 4px 0;"><strong>時間:</strong> ${durationMinutes}分</p>
          ${zoomUrl ? `<p style="margin: 8px 0;"><strong>Zoom:</strong> <a href="${escapeHtml(zoomUrl)}" style="color: #2563eb;">${escapeHtml(zoomUrl)}</a></p>` : ''}
          ${notes ? `<p style="margin: 4px 0;"><strong>備考:</strong> ${escapeHtml(notes)}</p>` : ''}
        </div>

        <p>お会いできるのを楽しみにしています！<br />Sayaka</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">Uchiwai</p>
      </div>
    `,
  });
}

/**
 * Send cancellation notification.
 */
export async function sendBookingCancellation(locals: any, opts: Omit<BookingEmailOpts, 'bookingId'>): Promise<void> {
  const resend = getResendClient(locals);
  if (!resend) return;

  const { to, userName, slotStart, durationMinutes } = opts;
  const dateAEST = formatDateTimeAEST(slotStart);
  const dateJST = formatDateTimeJST(slotStart);

  await resend.emails.send({
    from: FROM,
    to,
    subject: '【GOWM】予約がキャンセルされました / Booking Cancelled',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6b7280;">予約キャンセル / Booking Cancelled</h2>
        <p>${escapeHtml(userName)} さん</p>
        <p>以下の予約がキャンセルされました。</p>

        <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>日時 (AEST):</strong> ${dateAEST}</p>
          <p style="margin: 4px 0;"><strong>日時 (JST):</strong> ${dateJST}</p>
          <p style="margin: 4px 0;"><strong>時間:</strong> ${durationMinutes}分</p>
        </div>

        <p>
          <a href="https://uchiwai.app/booking" style="color: #f97316;">新しい予約はこちら</a>
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">Uchiwai</p>
      </div>
    `,
  });

  // Admin notification
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `[Cancelled] ${userName} — ${dateAEST}`,
    html: `
      <p><strong>Cancelled booking:</strong></p>
      <p>${escapeHtml(userName)} (${escapeHtml(to)})</p>
      <p>${dateAEST} — ${durationMinutes} min</p>
    `,
  });
}
