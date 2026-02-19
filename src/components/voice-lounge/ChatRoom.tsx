import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../../i18n/index';
import ParticipantList from './ParticipantList';
import ChatPanel from './ChatPanel';

interface Participant {
  id: string;
  name: string;
  muted: boolean;
}

interface ChatMessage {
  from: { id: string; name: string };
  message?: string;
  imageData?: string;
  timestamp: number;
}

interface Props {
  roomId: string;
  roomName: string;
  userId: string;
  userName: string;
  onLeave: () => void;
}

function AudioPlayer({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <audio ref={ref} autoPlay />;
}

export default function ChatRoom({ roomId, roomName, userId, userName, onLeave }: Props) {
  const { t } = useTranslation();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  const wsRef = useRef<WebSocket | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SimplePeerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const peersRef = useRef<Map<string, any>>(new Map());

  const cleanupPeers = useCallback(() => {
    peersRef.current.forEach(peer => peer.destroy());
    peersRef.current.clear();
    setRemoteStreams(new Map());
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }
    cleanupPeers();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/rooms/${roomId}/ws?userId=${userId}&userName=${encodeURIComponent(userName)}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const setupPeer = (targetId: string, initiator: boolean) => {
        const SP = SimplePeerRef.current;
        if (!SP) return null;

        const old = peersRef.current.get(targetId);
        if (old) old.destroy();

        const peer = new SP({
          initiator,
          stream: audioStreamRef.current || undefined,
          trickle: true,
        });

        peer.on('signal', (signal: unknown) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'signal', targetId, signal }));
          }
        });

        peer.on('stream', (remoteStream: MediaStream) => {
          setRemoteStreams(prev => new Map(prev).set(targetId, remoteStream));
        });

        peer.on('close', () => {
          peersRef.current.delete(targetId);
          setRemoteStreams(prev => {
            const next = new Map(prev);
            next.delete(targetId);
            return next;
          });
        });

        peer.on('error', () => {
          peersRef.current.delete(targetId);
        });

        peersRef.current.set(targetId, peer);
        return peer;
      };

      ws.onopen = () => {
        setConnected(true);
        setError('');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'participants-list':
            setParticipants(data.participants);
            data.participants.forEach((p: Participant) => {
              setupPeer(p.id, true);
            });
            break;
          case 'participant-joined':
            setParticipants(prev => [...prev, data.participant]);
            break;
          case 'participant-left': {
            setParticipants(prev => prev.filter(p => p.id !== data.participantId));
            const peer = peersRef.current.get(data.participantId);
            if (peer) {
              peer.destroy();
              peersRef.current.delete(data.participantId);
              setRemoteStreams(prev => {
                const next = new Map(prev);
                next.delete(data.participantId);
                return next;
              });
            }
            break;
          }
          case 'mute-update':
            setParticipants(prev =>
              prev.map(p => p.id === data.participantId ? { ...p, muted: data.muted } : p)
            );
            break;
          case 'chat-message':
            setMessages(prev => [...prev, {
              from: data.from,
              message: data.message,
              timestamp: data.timestamp,
            }]);
            break;
          case 'chat-image':
            setMessages(prev => [...prev, {
              from: data.from,
              imageData: data.imageData,
              timestamp: data.timestamp,
            }]);
            break;
          case 'signal': {
            let peer = peersRef.current.get(data.fromId);
            if (!peer) {
              peer = setupPeer(data.fromId, false);
            }
            try {
              peer?.signal(data.signal);
            } catch {}
            break;
          }
        }
      };

      ws.onerror = () => {
        setError(t('chatRoom.errorWs'));
        setConnected(false);
      };

      ws.onclose = () => {
        setConnected(false);
      };
    } catch {
      setError(t('chatRoom.errorWs'));
    }
  }, [roomId, userId, userName, cleanupPeers, t]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const mod = await import('simple-peer');
      SimplePeerRef.current = mod.default;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!cancelled) {
          audioStreamRef.current = stream;
        } else {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
      } catch {
        // No microphone — chat-only mode
      }

      if (!cancelled) {
        connectWebSocket();
      }
    };

    init();

    return () => {
      cancelled = true;
      wsRef.current?.close();
      audioStreamRef.current?.getTracks().forEach(t => t.stop());
      cleanupPeers();
    };
  }, [connectWebSocket, cleanupPeers]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && wsRef.current?.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [connectWebSocket]);

  const sendMessage = (message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'chat-message', message }));
    }
  };

  const sendImage = (imageData: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'chat-image', imageData }));
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (audioStreamRef.current) {
      audioStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMuted;
      });
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'mute-toggle', muted: newMuted }));
    }
  };

  return (
    <div>
      {/* Remote audio streams (hidden) */}
      {Array.from(remoteStreams.entries()).map(([id, stream]) => (
        <AudioPlayer key={id} stream={stream} />
      ))}

      {/* Room Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">{roomName}</h2>
          <span className={`text-xs ${connected ? 'text-green-700' : 'text-red-600'}`}>
            {connected ? t('chatRoom.connected') : t('chatRoom.disconnected')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isMuted ? '\u{1F507}' : '\u{1F50A}'}
          </button>
          <button
            onClick={onLeave}
            className="px-4 py-2 bg-red-50 border border-red-300 rounded-full text-sm text-red-600 hover:bg-red-100 transition-colors"
          >
            {t('chatRoom.leaveRoom')}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6">
          <p className="text-yellow-700 text-sm">{error}</p>
          <p className="text-yellow-600 text-xs mt-1">
            {t('chatRoom.errorWsSub')}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Participants */}
        <div className="md:col-span-1">
          <ParticipantList
            participants={[{ id: userId, name: userName + ' ' + t('chatRoom.you'), muted: isMuted }, ...participants]}
          />
        </div>

        {/* Chat */}
        <div className="md:col-span-2">
          <ChatPanel
            messages={messages}
            onSendMessage={sendMessage}
            onSendImage={sendImage}
            currentUserId={userId}
          />
        </div>
      </div>
    </div>
  );
}
