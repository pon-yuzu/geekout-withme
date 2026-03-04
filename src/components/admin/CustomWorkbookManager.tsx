import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase';

interface CustomWorkbook {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description: string | null;
  total_days: number;
  theme_color: string;
  navigator_name: string | null;
  storage_path: string;
  created_at: string;
  user_email?: string;
  display_name?: string;
}

interface UserOption {
  id: string;
  email: string;
  display_name: string | null;
}

export default function CustomWorkbookManager() {
  const [workbooks, setWorkbooks] = useState<CustomWorkbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [form, setForm] = useState({
    user_id: '',
    slug: '',
    title: '',
    description: '',
    total_days: 30,
    theme_color: '#e8a4b8',
    navigator_name: '',
  });
  const [saving, setSaving] = useState(false);

  const supabase = createSupabaseBrowserClient();

  const fetchWorkbooks = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/custom-workbooks');
    if (res.ok) {
      const data = await res.json();
      setWorkbooks(data.workbooks || []);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users?limit=200');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users?.map((u: any) => ({
        id: u.id,
        email: u.email,
        display_name: u.display_name,
      })) || []);
    }
  };

  useEffect(() => {
    fetchWorkbooks();
  }, []);

  const handleCreate = async () => {
    if (!form.user_id || !form.slug || !form.title) return;
    setSaving(true);

    const res = await fetch('/api/admin/custom-workbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: form.user_id,
        slug: form.slug,
        title: form.title,
        description: form.description || null,
        total_days: form.total_days,
        theme_color: form.theme_color,
        navigator_name: form.navigator_name || null,
        storage_path: `${form.user_id}/${form.slug}`,
      }),
    });

    if (res.ok) {
      setShowForm(false);
      setForm({ user_id: '', slug: '', title: '', description: '', total_days: 30, theme_color: '#e8a4b8', navigator_name: '' });
      fetchWorkbooks();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this custom workbook?')) return;
    const res = await fetch(`/api/admin/custom-workbooks?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchWorkbooks();
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Custom Workbooks ({workbooks.length})</h2>
        <button
          onClick={() => { setShowForm(!showForm); if (!showForm) fetchUsers(); }}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      {showForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Student</label>
              <select
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select a student...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.display_name || u.email} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                placeholder="cooking-english"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Cooking English 30 Days"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Total Days</label>
              <input
                type="number"
                value={form.total_days}
                onChange={(e) => setForm({ ...form, total_days: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Theme Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.theme_color}
                  onChange={(e) => setForm({ ...form, theme_color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={form.theme_color}
                  onChange={(e) => setForm({ ...form, theme_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Navigator Name</label>
              <input
                type="text"
                value={form.navigator_name}
                onChange={(e) => setForm({ ...form, navigator_name: e.target.value })}
                placeholder="Chef Bear"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="A 30-day cooking English course..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCreate}
              disabled={saving || !form.user_id || !form.slug || !form.title}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Creating...' : 'Create Workbook'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            After creating metadata here, upload HTML files using:<br />
            <code className="bg-white px-2 py-1 rounded text-xs">
              node scripts/upload-custom-workbook.mjs --user-id UUID --slug SLUG --title TITLE --dir /path/to/html
            </code>
          </p>
        </div>
      )}

      <div className="space-y-3">
        {workbooks.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No custom workbooks yet.</p>
        ) : (
          workbooks.map((wb) => (
            <div key={wb.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: wb.theme_color }}
              >
                {wb.title.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{wb.title}</div>
                <div className="text-sm text-gray-400">
                  {wb.display_name || wb.user_email || wb.user_id} · {wb.slug} · {wb.total_days} days
                </div>
              </div>
              <button
                onClick={() => handleDelete(wb.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
