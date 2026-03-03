import type { APIRoute } from 'astro';
import { getUserTier, hasTierAccess } from '../../../lib/tier';
import type { UserTier } from '../../../lib/tier';

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  const supabase = locals.supabase!;

  const { data: boards, error } = await supabase
    .from('boards')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch boards' }), { status: 500 });
  }

  // Determine user tier for access filtering
  let userTier: UserTier = 'free';
  if (user) {
    userTier = await getUserTier(supabase, user.id);
  }

  // Filter boards by access_tier
  const accessibleBoards = (boards || []).filter((b: any) => {
    if (!b.access_tier) return true;
    return hasTierAccess(userTier, b.access_tier as UserTier);
  });

  // Get latest thread for each board
  const boardIds = accessibleBoards.map((b: any) => b.id);

  if (boardIds.length === 0) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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
    .select('board_id')
    .in('board_id', boardIds);

  const countByBoard: Record<string, number> = {};
  for (const t of threadCounts || []) {
    countByBoard[t.board_id] = (countByBoard[t.board_id] || 0) + 1;
  }

  const result = accessibleBoards.map((b: any) => ({
    ...b,
    thread_count: countByBoard[b.id] || 0,
    latest_thread: latestByBoard[b.id] || null,
  }));

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
