import type { APIRoute } from 'astro';
import {
  getWorkbookProgress,
  getUserAllProgress,
  calculateStreak,
  markDayComplete,
  unmarkDayComplete,
  getWorkbook,
} from '../../../lib/workbook/db';

export const GET: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabase = (locals as any).supabase;
  const url = new URL(request.url);
  const workbookId = url.searchParams.get('workbookId');

  if (!workbookId) {
    return new Response(JSON.stringify({ error: 'Missing workbookId' }), { status: 400 });
  }

  const progress = await getWorkbookProgress(supabase, workbookId, user.id);
  const allProgress = await getUserAllProgress(supabase, user.id);
  const streak = calculateStreak(allProgress);

  return new Response(JSON.stringify({ progress, streak }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = (locals as any).user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabase = (locals as any).supabase;
  const { workbookId, dayNumber, completed } = await request.json();

  if (!workbookId || typeof dayNumber !== 'number' || typeof completed !== 'boolean') {
    return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400 });
  }

  const workbook = await getWorkbook(supabase, workbookId);
  if (!workbook) {
    return new Response(JSON.stringify({ error: 'Workbook not found' }), { status: 404 });
  }

  if (dayNumber < 1 || dayNumber > 30) {
    return new Response(JSON.stringify({ error: 'Invalid day number' }), { status: 400 });
  }

  try {
    if (completed) {
      await markDayComplete(supabase, workbookId, user.id, dayNumber);
    } else {
      await unmarkDayComplete(supabase, workbookId, user.id, dayNumber);
    }

    const allProgress = await getUserAllProgress(supabase, user.id);
    const streak = calculateStreak(allProgress);

    return new Response(JSON.stringify({ success: true, streak }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
