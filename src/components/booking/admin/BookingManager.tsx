import { useState, useEffect } from 'react';
import SlotRuleManager from './SlotRuleManager';
import AdminCouponManager from './AdminCouponManager';

interface AdminBooking {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  display_name: string | null;
  slot_start: string;
  slot_end: string;
  booking_type: string;
  status: string;
  coupon_id: string | null;
  amount_paid: number | null;
  zoom_url: string | null;
  admin_notes: string | null;
  notes: string | null;
  created_at: string;
}

type SubTab = 'schedule' | 'bookings' | 'coupons';

function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export default function BookingManager() {
  const [subTab, setSubTab] = useState<SubTab>('schedule');
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (subTab === 'bookings') fetchBookings();
  }, [subTab, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/booking/admin-bookings?${params}`);
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch('/api/booking/admin-bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const handleZoomUpdate = async (id: string, zoom_url: string) => {
    await fetch('/api/booking/admin-bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, zoom_url }),
    });
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, zoom_url } : b))
    );
  };

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSubTab('schedule')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            subTab === 'schedule'
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Schedule
        </button>
        <button
          onClick={() => setSubTab('bookings')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            subTab === 'bookings'
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          All Bookings
        </button>
        <button
          onClick={() => setSubTab('coupons')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            subTab === 'coupons'
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Coupons
        </button>
      </div>

      {subTab === 'schedule' && <SlotRuleManager />}
      {subTab === 'coupons' && <AdminCouponManager />}

      {subTab === 'bookings' && (
        <div>
          {/* Status filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['', 'confirmed', 'pending_payment', 'cancelled', 'completed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No bookings found.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1">
                      {/* Who */}
                      <div className="font-medium text-gray-800">
                        {b.user_id
                          ? (b.display_name || 'Member')
                          : `${b.guest_name} (${b.guest_email})`}
                      </div>
                      {/* When */}
                      <div className="text-sm text-gray-500 mt-0.5" suppressHydrationWarning>
                        {formatDateTime(b.slot_start)}
                      </div>
                      {b.notes && (
                        <div className="text-xs text-gray-400 mt-1">Note: {b.notes}</div>
                      )}
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.booking_type === 'personal'
                            ? 'bg-teal-100 text-teal-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {b.booking_type || 'public'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          b.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : b.status === 'pending_payment'
                              ? 'bg-yellow-100 text-yellow-700'
                              : b.status === 'cancelled'
                                ? 'bg-red-100 text-red-500'
                                : 'bg-gray-100 text-gray-500'
                        }`}>
                          {b.status}
                        </span>
                        {b.user_id == null && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                            guest
                          </span>
                        )}
                        {b.amount_paid != null && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                            ¥{b.amount_paid.toLocaleString()}
                          </span>
                        )}
                        {b.coupon_id && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-600">
                            coupon
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 text-xs">
                      {b.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(b.id, 'completed')}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleStatusChange(b.id, 'cancelled')}
                            className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {b.status === 'pending_payment' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'cancelled')}
                          className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                        >
                          Cancel
                        </button>
                      )}
                      {/* Zoom URL inline edit */}
                      <input
                        type="text"
                        placeholder="Zoom URL"
                        defaultValue={b.zoom_url || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (b.zoom_url || '')) {
                            handleZoomUpdate(b.id, e.target.value);
                          }
                        }}
                        className="px-2 py-1 border border-gray-200 rounded text-xs w-full min-w-[140px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
