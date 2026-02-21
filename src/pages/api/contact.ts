import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as any).runtime;
  const resendApiKey = runtime?.env?.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { name, email, category, message } = body;

  if (!name || !email || !category || !message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const categoryLabels: Record<string, string> = {
    bug: 'Bug Report / バグ報告',
    feedback: 'Feedback / ご意見・ご要望',
    trial: 'Free Trial / 無料体験申し込み',
  };

  const categoryLabel = categoryLabels[category] || category;

  const resend = new Resend(resendApiKey);

  try {
    await resend.emails.send({
      from: 'Geek Out With Me <noreply@geekout-withme.com>',
      to: 'ponglish.yukarizu@gmail.com',
      replyTo: email,
      subject: `[${categoryLabel}] ${name}`,
      html: `
        <h2>${categoryLabel}</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Category:</strong> ${categoryLabel}</p>
        <hr />
        <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Resend error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send' }), { status: 500 });
  }
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
