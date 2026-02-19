import { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/index';

interface Room {
  id: string;
  name: string;
  description: string | null;
  language: string;
  max_participants: number;
  participant_count: number;
  is_permanent: boolean;
  created_at: string;
}

interface Props {
  onJoinRoom: (roomId: string, roomName: string) => void;
}

export default function RoomList({ onJoinRoom }: Props) {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '', language: 'mixed' });
  const [creating, setCreating] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (Array.isArray(data)) setRooms(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    if (!newRoom.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom),
      });
      if (res.ok) {
        const data = await res.json();
        setNewRoom({ name: '', description: '', language: 'mixed' });
        setShowCreate(false);
        onJoinRoom(data.id, data.name);
      }
    } catch {}
    setCreating(false);
  };

  const languageEmoji: Record<string, string> = {
    english: '\u{1F1FA}\u{1F1F8}',
    japanese: '\u{1F1EF}\u{1F1F5}',
    mixed: '\u{1F30F}',
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">{t('rooms.loading')}</div>;
  }

  const permanentRooms = rooms.filter(r => r.is_permanent);
  const temporaryRooms = rooms.filter(r => !r.is_permanent);

  const renderRoom = (room: Room) => (
    <div
      key={room.id}
      className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center hover:bg-orange-50 transition-colors shadow-sm"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span>{languageEmoji[room.language] || '\u{1F30F}'}</span>
          <span className="font-medium">{room.name}</span>
          {room.is_permanent && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{t('rooms.alwaysOpen')}</span>
          )}
        </div>
        {room.description && (
          <p className="text-sm text-gray-500">{room.description}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {room.participant_count} / {room.max_participants} {t('rooms.participants')}
        </p>
      </div>
      <button
        onClick={() => onJoinRoom(room.id, room.name)}
        disabled={room.participant_count >= room.max_participants}
        className="px-5 py-2 bg-orange-50 border border-orange-300 rounded-full text-sm font-medium text-orange-500 hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('rooms.join')}
      </button>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('rooms.title')}</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          {t('rooms.createRoom')}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="font-medium mb-4">{t('rooms.newRoom.title')}</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t('rooms.newRoom.namePlaceholder')}
              value={newRoom.name}
              onChange={e => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-orange-500 text-gray-800 placeholder-gray-400"
            />
            <input
              type="text"
              placeholder={t('rooms.newRoom.descPlaceholder')}
              value={newRoom.description}
              onChange={e => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-orange-500 text-gray-800 placeholder-gray-400"
            />
            <select
              value={newRoom.language}
              onChange={e => setNewRoom(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-orange-500 text-gray-800"
            >
              <option value="mixed">{'\u{1F30F}'} {t('rooms.newRoom.mixed')}</option>
              <option value="english">{'\u{1F1FA}\u{1F1F8}'} {t('rooms.newRoom.english')}</option>
              <option value="japanese">{'\u{1F1EF}\u{1F1F5}'} {t('rooms.newRoom.japanese')}</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={creating || !newRoom.name.trim()}
                className="px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {creating ? t('rooms.newRoom.creating') : t('rooms.newRoom.create')}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-6 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {t('rooms.newRoom.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Rooms */}
      {permanentRooms.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">{t('rooms.permanent')}</h3>
          <div className="space-y-3">
            {permanentRooms.map(renderRoom)}
          </div>
        </div>
      )}

      {/* Temporary Rooms */}
      {temporaryRooms.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">{t('rooms.temporary')}</h3>
          <div className="space-y-3">
            {temporaryRooms.map(renderRoom)}
          </div>
        </div>
      )}

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">{'\u{1F399}\u{FE0F}'}</div>
          <h3 className="text-xl font-medium mb-2">{t('rooms.empty.title')}</h3>
          <p className="text-gray-500">{t('rooms.empty.desc')}</p>
        </div>
      )}
    </div>
  );
}
