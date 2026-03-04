import type { APIRoute } from 'astro';

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

  const { data: progress } = await supabase
    .from('custom_workbook_progress')
    .select('day_number, completed_at')
    .eq('workbook_id', workbookId)
    .eq('user_id', user.id)
    .order('day_number', { ascending: true });

  return new Response(JSON.stringify({ progress: progress ?? [] }), {
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

  // Verify ownership
  const { data: wb } = await supabase
    .from('custom_workbooks')
    .select('id, total_days')
    .eq('id', workbookId)
    .eq('user_id', user.id)
    .single();

  if (!wb) {
    return new Response(JSON.stringify({ error: 'Workbook not found' }), { status: 404 });
  }

  if (dayNumber < 1 || dayNumber > wb.total_days) {
    return new Response(JSON.stringify({ error: 'Invalid day number' }), { status: 400 });
  }

  try {
    if (completed) {
      await supabase
        .from('custom_workbook_progress')
        .upsert(
          { workbook_id: workbookId, user_id: user.id, day_number: dayNumber },
          { onConflict: 'workbook_id,user_id,day_number' }
        );
    } else {
      await supabase
        .from('custom_workbook_progress')
        .delete()
        .eq('workbook_id', workbookId)
        .eq('user_id', user.id)
        .eq('day_number', dayNumber);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
