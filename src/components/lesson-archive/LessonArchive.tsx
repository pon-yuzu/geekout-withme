import { useEffect, useState, useCallback } from 'react';
import FileCard from './FileCard';
import FileUploader from './FileUploader';

interface LessonFile {
  id: string;
  student_id: string;
  uploaded_by: string;
  file_name: string;
  storage_path: string;
  file_type: 'image' | 'pdf';
  file_size_bytes: number;
  session_date: string | null;
  memo: string | null;
  is_pinned: boolean;
  url: string;
  created_at: string;
}

interface Props {
  studentId: string;
  userId: string;
  isAdmin: boolean;
}

export default function LessonArchive({ studentId, userId, isAdmin }: Props) {
  const [files, setFiles] = useState<LessonFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (studentId !== userId) params.set('student_id', studentId);
      const res = await fetch(`/api/lesson-archive/files?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [studentId, userId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;
    const res = await fetch('/api/lesson-archive/files', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId }),
    });
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    }
  };

  const handleTogglePin = async (fileId: string, pinned: boolean) => {
    const res = await fetch('/api/lesson-archive/pin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, is_pinned: pinned }),
    });
    if (res.ok) {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, is_pinned: pinned } : f))
          .sort((a, b) => {
            if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
      );
    }
  };

  // Group files: pinned first, then by session_date, then undated
  const pinned = files.filter((f) => f.is_pinned);
  const unpinned = files.filter((f) => !f.is_pinned);

  const byDate: Record<string, LessonFile[]> = {};
  const undated: LessonFile[] = [];

  for (const f of unpinned) {
    if (f.session_date) {
      if (!byDate[f.session_date]) byDate[f.session_date] = [];
      byDate[f.session_date].push(f);
    } else {
      undated.push(f);
    }
  }

  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  const canUpload = isAdmin || studentId === userId;

  return (
    <div className="space-y-6">
      {canUpload && (
        <FileUploader studentId={studentId} onUploaded={fetchFiles} />
      )}

      {files.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p>No files yet</p>
        </div>
      )}

      {pinned.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2">📌 Pinned</h3>
          <div className="space-y-2">
            {pinned.map((f) => (
              <FileCard
                key={f.id}
                file={f}
                canDelete={f.uploaded_by === userId || isAdmin}
                canPin={isAdmin}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        </div>
      )}

      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            📅 {new Date(date + 'T00:00:00').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <div className="space-y-2">
            {byDate[date].map((f) => (
              <FileCard
                key={f.id}
                file={f}
                canDelete={f.uploaded_by === userId || isAdmin}
                canPin={isAdmin}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        </div>
      ))}

      {undated.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">📁 Other Files</h3>
          <div className="space-y-2">
            {undated.map((f) => (
              <FileCard
                key={f.id}
                file={f}
                canDelete={f.uploaded_by === userId || isAdmin}
                canPin={isAdmin}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
