import { useEffect, useState } from 'react';

interface Board {
  id: string;
  name_ja: string;
  slug: string;
  has_password: boolean;
}

export default function BoardPasswordManager() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchBoards = async () => {
    const res = await fetch('/api/admin/board-password');
    if (res.ok) setBoards(await res.json());
  };

  useEffect(() => { fetchBoards(); }, []);

  const handleSave = async (boardId: string) => {
    setSaving(boardId);
    setMessage(null);
    const res = await fetch('/api/admin/board-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board_id: boardId, password: passwords[boardId] || '' }),
    });
    if (res.ok) {
      setMessage('保存しました');
      setPasswords(p => ({ ...p, [boardId]: '' }));
      await fetchBoards();
    } else {
      setMessage('エラーが発生しました');
    }
    setSaving(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">掲示板パスワード管理</h2>
      <p className="text-sm text-gray-500">ボードに合言葉を設定すると、初回アクセス時にパスワード入力が必要になります。空欄で保存するとパスワードを解除します。</p>

      {boards.map(board => (
        <div key={board.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{board.name_ja}</p>
            <p className="text-xs text-gray-400">{board.slug}</p>
            {board.has_password && (
              <span className="text-xs text-teal-500">🔒 パスワード設定済み</span>
            )}
          </div>
          <input
            type="text"
            placeholder={board.has_password ? '新しい合言葉（空欄で削除）' : '合言葉を設定'}
            value={passwords[board.id] || ''}
            onChange={e => setPasswords(p => ({ ...p, [board.id]: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48"
          />
          <button
            onClick={() => handleSave(board.id)}
            disabled={saving === board.id}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50 whitespace-nowrap"
          >
            {saving === board.id ? '保存中...' : '保存'}
          </button>
        </div>
      ))}

      {message && (
        <p className={`text-sm ${message.includes('エラー') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
