import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Check premium status
  const supabase = locals.supabase;
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .limit(1);

  if (!subs?.length) {
    return new Response(JSON.stringify({ error: 'Premium subscription required' }), { status: 403 });
  }

  const roomId = params.id;
  if (!roomId) {
    return new Response(JSON.stringify({ error: 'Room ID required' }), { status: 400 });
  }

  // Verify room exists and is active
  const { data: room } = await supabase
    .from('voice_rooms')
    .select('id, max_participants, participant_count')
    .eq('id', roomId)
    .eq('is_active', true)
    .single();

  if (!room) {
    return new Response(JSON.stringify({ error: 'Room not found or inactive' }), { status: 404 });
  }

  if (room.participant_count >= room.max_participants) {
    return new Response(JSON.stringify({ error: 'Room is full' }), { status: 409 });
  }

  const upgradeHeader = request.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  const voiceRoom = (locals as any).runtime?.env?.VOICE_ROOM;
  if (!voiceRoom) {
    return new Response(JSON.stringify({ error: 'Durable Objects not available' }), { status: 503 });
  }

  const doId = voiceRoom.idFromName(roomId);
  const stub = voiceRoom.get(doId);

  const url = new URL(request.url);
  url.pathname = '/ws';
  url.searchParams.set('userId', user.id);
  url.searchParams.set('userName', user.user_metadata?.display_name || user.email || 'Anonymous');
  url.searchParams.set('maxParticipants', String(room.max_participants));
  url.searchParams.set('roomId', roomId);

  return stub.fetch(new Request(url.toString(), request));
};
