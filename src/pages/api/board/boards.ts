import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase!;

  const { data: boards, error } = await supabase
    .from('boards')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch boards' }), { status: 500 });
  }

  // Get latest thread for each board
  const boardIds = boards.map((b: any) => b.id);
  const { data: latestThreads } = await supabase
    .from('threads')
    .select('board_id, title, created_at')
    .in('board_id', boardIds)
    .order('created_at', { ascending: false });

  const latestByBoard: Record<string, any> = {};
  for (const t of latestThreads || []) {
    if (!latestByBoard[t.board_id]) {
      latestByBoard[t.board_id] = t;
    }
  }

  // Get thread counts per board
  const { data: threadCounts } = await supabase
    .from('threads')
    .select('board_id');

  const countByBoard: Record<string, number> = {};
  for (const t of threadCounts || []) {
    countByBoard[t.board_id] = (countByBoard[t.board_id] || 0) + 1;
  }

  const result = boards.map((b: any) => ({
    ...b,
    thread_count: countByBoard[b.id] || 0,
    latest_thread: latestByBoard[b.id] || null,
  }));

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
