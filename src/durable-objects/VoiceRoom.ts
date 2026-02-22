interface Participant {
  id: string;
  name: string;
  ws: WebSocket;
  muted: boolean;
}

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

const MAX_CHAT_MESSAGE_LENGTH = 1000;
const MAX_SIGNAL_SIZE = 100_000;
const MAX_IMAGE_SIZE = 1_000_000;
const DEFAULT_MAX_PARTICIPANTS = 50;

export class VoiceRoom {
  private state: DurableObjectState;
  private env: Env;
  private participants: Map<string, Participant> = new Map();
  private maxParticipants: number = DEFAULT_MAX_PARTICIPANTS;
  private roomId: string | null = null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      const upgradeHeader = request.headers.get('Upgrade');
      if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
      }

      const userId = url.searchParams.get('userId') || crypto.randomUUID();
      const userName = url.searchParams.get('userName') || 'Anonymous';
      const maxParam = url.searchParams.get('maxParticipants');
      if (maxParam) this.maxParticipants = parseInt(maxParam, 10) || DEFAULT_MAX_PARTICIPANTS;

      const roomIdParam = url.searchParams.get('roomId');
      if (roomIdParam && !this.roomId) {
        this.roomId = roomIdParam;
      }

      if (this.participants.size >= this.maxParticipants) {
        return new Response(JSON.stringify({ error: 'Room is full' }), { status: 409 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      this.handleSession(server, userId, userName);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response('Not found', { status: 404 });
  }

  private handleSession(ws: WebSocket, userId: string, userName: string) {
    (ws as any).accept();

    const participant: Participant = { id: userId, name: userName, ws, muted: false };
    this.participants.set(userId, participant);
    this.syncParticipantCount();

    // Notify others of new participant
    this.broadcast(JSON.stringify({
      type: 'participant-joined',
      participant: { id: userId, name: userName, muted: false },
    }), userId);

    // Send current participants to the new user
    const existingParticipants = Array.from(this.participants.values())
      .filter(p => p.id !== userId)
      .map(p => ({ id: p.id, name: p.name, muted: p.muted }));

    ws.send(JSON.stringify({
      type: 'participants-list',
      participants: existingParticipants,
    }));

    ws.addEventListener('message', (event) => {
      try {
        const raw = event.data as string;
        const data = JSON.parse(raw);
        if (!data || typeof data.type !== 'string') return;

        switch (data.type) {
          case 'chat-message': {
            if (typeof data.message !== 'string' || data.message.length === 0) break;
            if (raw.length > MAX_SIGNAL_SIZE) break;
            const message = data.message.slice(0, MAX_CHAT_MESSAGE_LENGTH);
            this.broadcast(JSON.stringify({
              type: 'chat-message',
              from: { id: userId, name: userName },
              message,
              timestamp: Date.now(),
            }));
            break;
          }

          case 'chat-image': {
            if (typeof data.imageData !== 'string') break;
            if (raw.length > MAX_IMAGE_SIZE) break;
            this.broadcast(JSON.stringify({
              type: 'chat-image',
              from: { id: userId, name: userName },
              imageData: data.imageData,
              timestamp: Date.now(),
            }));
            break;
          }

          case 'signal': {
            if (raw.length > MAX_SIGNAL_SIZE) break;
            if (typeof data.targetId !== 'string' || !this.participants.has(data.targetId)) break;
            if (typeof data.signal !== 'object' || data.signal === null) break;
            const target = this.participants.get(data.targetId);
            if (target) {
              target.ws.send(JSON.stringify({
                type: 'signal',
                fromId: userId,
                signal: data.signal,
              }));
            }
            break;
          }

          case 'mute-toggle': {
            if (typeof data.muted !== 'boolean') break;
            participant.muted = data.muted;
            this.broadcast(JSON.stringify({
              type: 'mute-update',
              participantId: userId,
              muted: data.muted,
            }));
            break;
          }

          case 'translated_message': {
            if (typeof data.originalText !== 'string' || typeof data.translatedText !== 'string') break;
            if (raw.length > MAX_SIGNAL_SIZE) break;
            this.broadcast(JSON.stringify({
              type: 'translated_message',
              from: { id: userId, name: userName },
              originalText: data.originalText.slice(0, MAX_CHAT_MESSAGE_LENGTH),
              translatedText: data.translatedText.slice(0, MAX_CHAT_MESSAGE_LENGTH),
              originalLang: data.originalLang === 'ja' ? 'ja' : 'en',
              timestamp: Date.now(),
            }));
            break;
          }

          case 'card': {
            if (typeof data.topic !== 'string' || typeof data.prompt !== 'string') break;
            if (raw.length > MAX_SIGNAL_SIZE) break;
            this.broadcast(JSON.stringify({
              type: 'card',
              from: { id: userId, name: userName },
              category: String(data.category || ''),
              topic: data.topic.slice(0, 200),
              topicJa: String(data.topicJa || '').slice(0, 200),
              prompt: data.prompt.slice(0, MAX_CHAT_MESSAGE_LENGTH),
              vocab: Array.isArray(data.vocab) ? data.vocab.slice(0, 20) : [],
              timestamp: Date.now(),
            }));
            break;
          }

          case 'timer_event': {
            if (!['start', 'language_switch', 'end'].includes(data.event)) break;
            if (raw.length > MAX_SIGNAL_SIZE) break;
            this.broadcast(JSON.stringify({
              type: 'timer_event',
              from: { id: userId, name: userName },
              event: data.event,
              totalMinutes: typeof data.totalMinutes === 'number' ? data.totalMinutes : undefined,
              newLang: data.newLang === 'ja' || data.newLang === 'en' ? data.newLang : undefined,
              timestamp: Date.now(),
            }));
            break;
          }
        }
      } catch {
        // Invalid message format — silently drop
      }
    });

    const handleDisconnect = () => {
      if (!this.participants.has(userId)) return;
      this.participants.delete(userId);
      this.syncParticipantCount();
      this.broadcast(JSON.stringify({
        type: 'participant-left',
        participantId: userId,
      }));
      if (this.participants.size === 0) {
        this.cleanupRoom();
      }
    };

    ws.addEventListener('close', handleDisconnect);
    ws.addEventListener('error', handleDisconnect);
  }

  private syncParticipantCount() {
    if (!this.roomId || !this.env.SUPABASE_URL || !this.env.SUPABASE_SERVICE_ROLE_KEY) return;
    const count = this.participants.size;
    fetch(
      `${this.env.SUPABASE_URL}/rest/v1/voice_rooms?id=eq.${this.roomId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': this.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${this.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ participant_count: count }),
      }
    ).catch(() => {});
  }

  private async cleanupRoom() {
    if (!this.roomId || !this.env.SUPABASE_URL || !this.env.SUPABASE_SERVICE_ROLE_KEY) return;

    try {
      // Check if room is permanent
      const checkRes = await fetch(
        `${this.env.SUPABASE_URL}/rest/v1/voice_rooms?id=eq.${this.roomId}&select=is_permanent`,
        {
          headers: {
            'apikey': this.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${this.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );
      const rooms = await checkRes.json() as { is_permanent: boolean }[];

      if (rooms.length > 0 && !rooms[0].is_permanent) {
        await fetch(
          `${this.env.SUPABASE_URL}/rest/v1/voice_rooms?id=eq.${this.roomId}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': this.env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${this.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ is_active: false }),
          }
        );
      }
    } catch {
      // Cleanup failed — room will remain in DB
    }
  }

  private broadcast(message: string, excludeId?: string) {
    const dead: string[] = [];
    for (const [id, participant] of this.participants) {
      if (id !== excludeId) {
        try {
          participant.ws.send(message);
        } catch {
          dead.push(id);
        }
      }
    }
    for (const id of dead) {
      this.participants.delete(id);
      this.broadcast(JSON.stringify({ type: 'participant-left', participantId: id }), id);
    }
  }
}
