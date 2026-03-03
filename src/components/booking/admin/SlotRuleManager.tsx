import { useState, useEffect } from 'react';
import type { BookingSlot, OneoffSlot } from '../../../lib/booking/types';

const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_JA = ['日', '月', '火', '水', '木', '金', '土'];

type SlotTab = 'recurring' | 'oneoff';

function utcTimeToLocal(utcTime: string, refDate: Date): string {
  const [h, m] = utcTime.split(':').map(Number);
  const d = new Date(refDate);
  d.setUTCHours(h, m, 0, 0);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function utcTimeToLocalByDow(utcTime: string, dayOfWeek: number): string {
  const baseDate = new Date();
  const currentDay = baseDate.getUTCDay();
  const diff = dayOfWeek - currentDay;
  baseDate.setUTCDate(baseDate.getUTCDate() + diff);
  return utcTimeToLocal(utcTime, baseDate);
}

function getLocalTimeZoneName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function formatLocalDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(d);
}

export default function SlotRuleManager() {
  const [slotTab, setSlotTab] = useState<SlotTab>('recurring');

  // ── Recurring state ──
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newDow, setNewDow] = useState(1);
  const [newStart, setNewStart] = useState('05:00');
  const [newEnd, setNewEnd] = useState('08:00');

  // ── One-off state ──
  const [oneoffs, setOneoffs] = useState<OneoffSlot[]>([]);
  const [oneoffLoading, setOneoffLoading] = useState(true);
  const [showOneoffAdd, setShowOneoffAdd] = useState(false);
  const [oneoffSaving, setOneoffSaving] = useState(false);
  const [ooDate, setOoDate] = useState('');
  const [ooStart, setOoStart] = useState('05:00');
  const [ooEnd, setOoEnd] = useState('08:00');

  useEffect(() => {
    fetchSlots();
    fetchOneoffs();
  }, []);

  // ── Recurring handlers ──
  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/booking/admin-slots');
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/booking/admin-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_of_week: newDow,
          start_time: newStart,
          end_time: newEnd,
        }),
      });
      if (res.ok) {
        setShowAdd(false);
        fetchSlots();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (slot: BookingSlot) => {
    await fetch('/api/booking/admin-slots', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: slot.id, is_active: !slot.is_active }),
    });
    setSlots((prev) =>
      prev.map((s) => (s.id === slot.id ? { ...s, is_active: !s.is_active } : s))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    await fetch('/api/booking/admin-slots', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  // ── One-off handlers ──
  const fetchOneoffs = async () => {
    try {
      const res = await fetch('/api/booking/admin-oneoff-slots');
      const data = await res.json();
      setOneoffs(data.slots ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setOneoffLoading(false);
    }
  };

  const handleOneoffAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ooDate) return;
    setOneoffSaving(true);
    try {
      const res = await fetch('/api/booking/admin-oneoff-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_date: ooDate,
          start_time: ooStart,
          end_time: ooEnd,
        }),
      });
      if (res.ok) {
        setShowOneoffAdd(false);
        fetchOneoffs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOneoffSaving(false);
    }
  };

  const handleOneoffDelete = async (id: string) => {
    if (!confirm('Delete this one-off slot?')) return;
    await fetch('/api/booking/admin-oneoff-slots', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setOneoffs((prev) => prev.filter((s) => s.id !== id));
  };

  // ── Loading ──
  if (loading || oneoffLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSlotTab('recurring')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            slotTab === 'recurring'
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Recurring ({slots.length})
        </button>
        <button
          onClick={() => setSlotTab('oneoff')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            slotTab === 'oneoff'
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          One-off ({oneoffs.length})
        </button>
      </div>

      {/* ═══════════ RECURRING TAB ═══════════ */}
      {slotTab === 'recurring' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Weekly Rules
            </h3>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              + Add Rule
            </button>
          </div>

          {showAdd && (
            <form onSubmit={handleAdd} className="bg-orange-50 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Day</label>
                  <select
                    value={newDow}
                    onChange={(e) => setNewDow(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                  >
                    {DAY_NAMES_EN.map((name, i) => (
                      <option key={i} value={i}>{name} ({DAY_NAMES_JA[i]})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Start (UTC)
                    <span className="text-orange-500 ml-1" suppressHydrationWarning>
                      = {utcTimeToLocalByDow(newStart, newDow)} local
                    </span>
                  </label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    End (UTC)
                    <span className="text-orange-500 ml-1" suppressHydrationWarning>
                      = {utcTimeToLocalByDow(newEnd, newDow)} local
                    </span>
                  </label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? '...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-1.5 text-gray-500 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {slots.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No recurring rules yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase border-b">
                    <th className="py-2 pr-3">Day</th>
                    <th className="py-2 pr-3">Time (UTC)</th>
                    <th className="py-2 pr-3">Local</th>
                    <th className="py-2 pr-3">Active</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot.id} className={`border-b border-gray-50 ${!slot.is_active ? 'opacity-40' : ''}`}>
                      <td className="py-2.5 pr-3 font-medium">
                        {DAY_NAMES_EN[slot.day_of_week]} ({DAY_NAMES_JA[slot.day_of_week]})
                      </td>
                      <td className="py-2.5 pr-3">
                        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                      </td>
                      <td className="py-2.5 pr-3 text-orange-600" suppressHydrationWarning>
                        {utcTimeToLocalByDow(slot.start_time, slot.day_of_week)} – {utcTimeToLocalByDow(slot.end_time, slot.day_of_week)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <button
                          onClick={() => handleToggle(slot)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            slot.is_active ? 'bg-green-400' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                              slot.is_active ? 'left-5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="py-2.5">
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ ONE-OFF TAB ═══════════ */}
      {slotTab === 'oneoff' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              One-off Slots
            </h3>
            <button
              onClick={() => setShowOneoffAdd(!showOneoffAdd)}
              className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors"
            >
              + Add One-off
            </button>
          </div>

          {showOneoffAdd && (
            <form onSubmit={handleOneoffAdd} className="bg-orange-50 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={ooDate}
                    onChange={(e) => setOoDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Start (UTC)
                    {ooDate && (
                      <span className="text-orange-500 ml-1" suppressHydrationWarning>
                        = {utcTimeToLocal(ooStart, new Date(ooDate + 'T00:00:00Z'))} local
                      </span>
                    )}
                  </label>
                  <input
                    type="time"
                    value={ooStart}
                    onChange={(e) => setOoStart(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    End (UTC)
                    {ooDate && (
                      <span className="text-orange-500 ml-1" suppressHydrationWarning>
                        = {utcTimeToLocal(ooEnd, new Date(ooDate + 'T00:00:00Z'))} local
                      </span>
                    )}
                  </label>
                  <input
                    type="time"
                    value={ooEnd}
                    onChange={(e) => setOoEnd(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={oneoffSaving}
                  className="px-4 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {oneoffSaving ? '...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOneoffAdd(false)}
                  className="px-4 py-1.5 text-gray-500 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {oneoffs.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No one-off slots yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase border-b">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Time (UTC)</th>
                    <th className="py-2 pr-3">Local</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {oneoffs.map((slot) => {
                    const refDate = new Date(slot.slot_date + 'T00:00:00Z');
                    const isPast = new Date(slot.slot_date + 'T23:59:59') < new Date();
                    return (
                      <tr key={slot.id} className={`border-b border-gray-50 ${isPast || !slot.is_active ? 'opacity-40' : ''}`}>
                        <td className="py-2.5 pr-3 font-medium" suppressHydrationWarning>
                          {formatLocalDate(slot.slot_date)}
                        </td>
                        <td className="py-2.5 pr-3">
                          {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                        </td>
                        <td className="py-2.5 pr-3 text-orange-600" suppressHydrationWarning>
                          {utcTimeToLocal(slot.start_time, refDate)} – {utcTimeToLocal(slot.end_time, refDate)}
                        </td>
                        <td className="py-2.5">
                          <button
                            onClick={() => handleOneoffDelete(slot.id)}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2" suppressHydrationWarning>
        Local timezone: {getLocalTimeZoneName()}
      </p>
    </div>
  );
}
