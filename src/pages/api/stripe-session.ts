import type { APIRoute } from 'astro';
import { createStripeClient } from '../../lib/stripe';
import { findCourseByPaymentLink } from '../../lib/workbook/paid-courses';

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId || !sessionId.startsWith('cs_')) {
    return new Response(JSON.stringify({ error: 'Invalid session_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const runtime = (locals as any).runtime;
  const stripeSecretKey = runtime?.env?.STRIPE_SECRET_KEY || import.meta.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stripe = createStripeClient(stripeSecretKey);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({ error: 'Payment not completed' }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const paymentLinkId = (session as any).payment_link as string | null;
    if (!paymentLinkId) {
      return new Response(JSON.stringify({ error: 'Not a Payment Link purchase' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const course = findCourseByPaymentLink(paymentLinkId);
    if (!course) {
      return new Response(JSON.stringify({ error: 'Unknown course' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const customerName = session.customer_details?.name || '';

    return new Response(JSON.stringify({
      customerName,
      courseId: course.id,
      password: course.password,
      baseUrl: course.baseUrl,
      courseTitle: course.title,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('stripe-session error:', err.message);
    return new Response(JSON.stringify({ error: 'Failed to retrieve session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
