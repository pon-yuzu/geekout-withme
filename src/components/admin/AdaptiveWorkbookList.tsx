import { useEffect, useState } from 'react';
import type { StudentConfigRow, ConfigStatus } from '../../lib/adaptive-workbook/types';

interface Props {
  onNew: () => void;
  onSelect: (config: StudentConfigRow) => void;
}

const STATUS_COLORS: Record<ConfigStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  approved: 'bg-blue-100 text-blue-700',
  generating: 'bg-yellow-100 text-yellow-700',
  review: 'bg-purple-100 text-purple-700',
  active: 'bg-green-100 text-green-700',
};

const STATUS_LABELS: Record<ConfigStatus, string> = {
  draft: 'Draft',
  approved: 'Approved',
  generating: 'Generating...',
  review: 'Review',
  active: 'Active',
};

export default function AdaptiveWorkbookList({ onNew, onSelect }: Props) {
  const [configs, setConfigs] = useState<StudentConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/wb-configs');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConfigs(data.configs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this config and all generated content?')) return;
    try {
      await fetch(`/api/admin/wb-configs?id=${id}`, { method: 'DELETE' });
      fetchConfigs();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Adaptive Workbooks</h2>
        <button
          onClick={onNew}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          + New Workbook
        </button>
      </div>

      {configs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-orange-100">
          <p className="text-gray-500 mb-4">No adaptive workbooks yet</p>
          <button
            onClick={onNew}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Create First Workbook
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {configs.map((config) => {
            const studentName = config.display_name || config.config_json?.student?.display_name || 'Unknown';
            const status = config.status as ConfigStatus;
            const progress = config.status === 'generating'
              ? `${config.days_completed}/${config.total_days} days`
              : null;

            return (
              <div
                key={config.id}
                className="bg-white rounded-xl border border-orange-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelect(config)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-800">{studentName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {config.user_email || ''}
                      {config.config_json?.level?.cefr && ` · ${config.config_json.level.cefr}`}
                      {config.config_json?.navigator?.name && ` · Navigator: ${config.config_json.navigator.name}`}
                    </p>
                    {progress && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all"
                              style={{ width: `${(config.days_completed / config.total_days) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{progress}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(config.id); }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
