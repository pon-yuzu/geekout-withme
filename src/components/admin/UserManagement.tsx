import { useEffect, useState, useCallback } from 'react';

interface User {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string;
  tier: string;
  tier_expires_at: string | null;
  effectiveTier: string;
  hasLineSupport: boolean;
  created_at: string;
}

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-gray-100 text-gray-600' },
  premium: { label: 'Premium', color: 'bg-orange-100 text-orange-700' },
  personal: { label: 'Personal', color: 'bg-teal-100 text-teal-700' },
};

function toLocalDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expiresEdit, setExpiresEdit] = useState<Record<string, string>>({});

  const perPage = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleTierChange = async (userId: string, newTier: string, expiresAt?: string) => {
    setUpdating(userId);
    try {
      const payload: any = { userId, tier: newTier };
      if (newTier === 'personal' && expiresAt) {
        payload.tier_expires_at = expiresAt;
      }
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setExpiresEdit((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update tier:', err);
    } finally {
      setUpdating(null);
    }
  };

  const handleTierSelect = (userId: string, newTier: string) => {
    if (newTier === 'personal') {
      const user = users.find((u) => u.id === userId);
      const existing = user?.tier_expires_at ? toLocalDate(user.tier_expires_at) : '';
      setExpiresEdit((prev) => ({ ...prev, [userId]: existing }));
    } else {
      setExpiresEdit((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      handleTierChange(userId, newTier);
    }
  };

  const handleExpiresConfirm = (userId: string) => {
    handleTierChange(userId, 'personal', expiresEdit[userId] || undefined);
  };

  const handleExpiresCancel = (userId: string) => {
    setExpiresEdit((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-orange-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">User</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Effective Tier</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Set Tier</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const tierInfo = TIER_LABELS[user.effectiveTier] || TIER_LABELS.free;
                  const showExpiresInput = expiresEdit.hasOwnProperty(user.id);
                  const isExpired = user.tier_expires_at && new Date(user.tier_expires_at) < new Date();
                  return (
                    <tr key={user.id} className="border-t border-orange-50 hover:bg-orange-25">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-medium text-xs">
                              {(user.display_name || user.email || '?')[0].toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-gray-800">
                            {user.display_name || 'No name'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tierInfo.color}`}>
                          {tierInfo.label}
                        </span>
                        {user.tier !== user.effectiveTier && (
                          <span className="ml-1 text-[10px] text-gray-400">(via subscription)</span>
                        )}
                        {user.tier_expires_at && (
                          <span className={`ml-1 text-[10px] ${isExpired ? 'text-red-400' : 'text-gray-400'}`}>
                            {isExpired ? 'exp ' : '~'}
                            {toLocalDate(user.tier_expires_at)}
                          </span>
                        )}
                        {user.hasLineSupport && (
                          <span className="ml-1 px-1.5 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-full">LINE</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <select
                            value={showExpiresInput ? 'personal' : user.tier}
                            onChange={(e) => handleTierSelect(user.id, e.target.value)}
                            disabled={updating === user.id}
                            className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
                          >
                            <option value="free">Free</option>
                            <option value="premium">Premium</option>
                            <option value="personal">Personal</option>
                          </select>
                          {showExpiresInput && (
                            <div className="flex items-center gap-1 mt-1">
                              <input
                                type="date"
                                value={expiresEdit[user.id] || ''}
                                onChange={(e) => setExpiresEdit((prev) => ({ ...prev, [user.id]: e.target.value }))}
                                className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-300"
                              />
                              <button
                                onClick={() => handleExpiresConfirm(user.id)}
                                disabled={updating === user.id}
                                className="px-2 py-1 bg-teal-500 text-white text-xs rounded-lg hover:bg-teal-600 disabled:opacity-50"
                              >
                                {updating === user.id ? '...' : 'OK'}
                              </button>
                              <button
                                onClick={() => handleExpiresCancel(user.id)}
                                className="px-2 py-1 text-gray-400 text-xs hover:text-gray-600"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {updating === user.id && !showExpiresInput && (
                            <span className="text-xs text-orange-500">Saving...</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(user.created_at).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-30 hover:bg-orange-50"
              >
                Prev
              </button>
              <span className="px-3 py-1 text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-30 hover:bg-orange-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
