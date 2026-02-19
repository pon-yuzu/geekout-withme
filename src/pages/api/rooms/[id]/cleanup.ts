import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ params, request }) => {
  const roomId = params.id;
  if (!roomId) {
    return new Response(JSON.stringify({ error: 'Room ID required' }), { status: 400 });
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
  }

  // Verify internal caller via service role key
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${supabaseServiceKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: room } = await supabase
    .from('voice_rooms')
    .select('is_permanent')
    .eq('id', roomId)
    .single();

  if (!room) {
    return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
  }

  if (room.is_permanent) {
    return new Response(JSON.stringify({ message: 'Permanent room, no cleanup needed' }), { status: 200 });
  }

  const { error } = await supabase
    .from('voice_rooms')
    .update({ is_active: false })
    .eq('id', roomId);

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to cleanup room' }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Room deactivated' }), { status: 200 });
};
