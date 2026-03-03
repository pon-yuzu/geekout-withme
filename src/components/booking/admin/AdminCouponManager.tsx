import { useState, useEffect, useCallback } from 'react';
import type { BookingCoupon } from '../../../lib/booking/types';

interface SearchUser {
  id: string;
  display_name: string | null;
  email: string;
}

export default function AdminCouponManager() {
  const [coupons, setCoupons] = useState<BookingCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add form state
  const [couponType, setCouponType] = useState<'code' | 'user'>('code');
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [userId, setUserId] = useState('');
  const [selectedUserLabel, setSelectedUserLabel] = useState('');
  const [priceYen, setPriceYen] = useState<string>('');
  const [maxUses, setMaxUses] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState('');

  // User search state
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<SearchUser[]>([]);
  const [userSearching, setUserSearching] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/booking/admin-coupons');
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced user search
  const searchUsers = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setUserResults([]);
      return;
    }
    setUserSearching(true);
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setUserResults(
        (data.users ?? []).map((u: any) => ({
          id: u.id,
          display_name: u.display_name,
          email: u.email,
        }))
      );
      setShowUserDropdown(true);
    } catch {
      setUserResults([]);
    } finally {
      setUserSearching(false);
    }
  }, []);

  useEffect(() => {
    if (couponType !== 'user') return;
    const timer = setTimeout(() => searchUsers(userSearch), 300);
    return () => clearTimeout(timer);
  }, [userSearch, couponType, searchUsers]);

  const handleSelectUser = (user: SearchUser) => {
    setUserId(user.id);
    setSelectedUserLabel(user.display_name || user.email);
    setUserSearch('');
    setShowUserDropdown(false);
    setUserResults([]);
  };

  const handleClearUser = () => {
    setUserId('');
    setSelectedUserLabel('');
    setUserSearch('');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { label };
      if (couponType === 'code') {
        payload.code = code;
      } else {
        payload.user_id = userId || undefined;
      }
      if (priceYen !== '') payload.price_yen = Number(priceYen);
      if (maxUses !== '') payload.max_uses = Number(maxUses);
      if (expiresAt) payload.expires_at = new Date(expiresAt).toISOString();

      const res = await fetch('/api/booking/admin-coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowAdd(false);
        resetForm();
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setCouponType('code');
    setCode('');
    setLabel('');
    setUserId('');
    setSelectedUserLabel('');
    setUserSearch('');
    setPriceYen('');
    setMaxUses('');
    setExpiresAt('');
  };

  const handleToggleActive = async (coupon: BookingCoupon) => {
    await fetch('/api/booking/admin-coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: coupon.id, is_active: !coupon.is_active }),
    });
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !c.is_active } : c))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await fetch('/api/booking/admin-coupons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Coupons ({coupons.length})
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Add Coupon
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-orange-50 rounded-xl p-4 mb-4 space-y-3">
          {/* Coupon type selector */}
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setCouponType('code')}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                couponType === 'code' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Code-based
            </button>
            <button
              type="button"
              onClick={() => setCouponType('user')}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                couponType === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              User-bound (auto)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Label *</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Mocca Special"
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                required
              />
            </div>
            {couponType === 'code' ? (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MOCCA2026"
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-mono"
                  required
                />
              </div>
            ) : (
              <div className="relative">
                <label className="block text-xs text-gray-500 mb-1">User *</label>
                {userId ? (
                  <div className="flex items-center gap-1 px-2 py-1.5 border border-teal-300 bg-teal-50 rounded-lg text-sm">
                    <span className="flex-1 truncate text-teal-700">{selectedUserLabel}</span>
                    <button
                      type="button"
                      onClick={handleClearUser}
                      className="text-teal-400 hover:text-teal-600 text-xs shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by name..."
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                      autoComplete="off"
                    />
                    {userSearching && (
                      <div className="absolute right-2 top-7">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500" />
                      </div>
                    )}
                    {showUserDropdown && userResults.length > 0 && (
                      <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {userResults.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectUser(u)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50 border-b border-gray-50 last:border-0"
                          >
                            <div className="font-medium text-gray-800">{u.display_name || 'No name'}</div>
                            <div className="text-xs text-gray-400">{u.email}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    {showUserDropdown && userResults.length === 0 && userSearch.trim().length >= 2 && !userSearching && (
                      <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs text-gray-400">
                        No users found
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Final price ¥
                <span className="text-orange-500 ml-1">(empty=free)</span>
              </label>
              <input
                type="number"
                value={priceYen}
                onChange={(e) => setPriceYen(e.target.value)}
                placeholder="0 (free)"
                min="0"
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max uses (empty=unlimited)</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Expires at</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || (couponType === 'user' && !userId)}
              className="px-4 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {saving ? '...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); resetForm(); }}
              className="px-4 py-1.5 text-gray-500 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {coupons.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No coupons yet.</p>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => (
            <div
              key={c.id}
              className={`bg-white rounded-xl border border-gray-100 p-4 ${!c.is_active ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{c.label}</div>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {c.code ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-orange-100 text-orange-700">
                        {c.code}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700">
                        Auto (user-bound)
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                      {c.price_yen != null ? `¥${c.price_yen.toLocaleString()}` : '¥0 (free)'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                      {c.used_count}{c.max_uses != null ? `/${c.max_uses}` : ''} used
                    </span>
                    {c.expires_at && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600" suppressHydrationWarning>
                        exp: {new Date(c.expires_at).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                  {c.user_id && (
                    <div className="text-xs text-gray-400 mt-1 font-mono">
                      user: {c.user_id.slice(0, 8)}...
                    </div>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handleToggleActive(c)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      c.is_active ? 'bg-green-400' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        c.is_active ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
