import { useState, useRef } from 'react';

interface FileUploaderProps {
  studentId: string;
  onUploaded: () => void;
}

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

export default function FileUploader({ studentId, onUploaded }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [sessionDate, setSessionDate] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          setError(`${file.name}: Only images and PDFs are allowed`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name}: File too large (max 10MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('student_id', studentId);
        if (sessionDate) formData.append('session_date', sessionDate);
        if (memo) formData.append('memo', memo);

        const res = await fetch('/api/lesson-archive/files', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Upload failed');
        }
      }
      setMemo('');
      onUploaded();
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap gap-3 mb-3">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-gray-500 block mb-1">Session Date</label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div className="flex-[2] min-w-[200px]">
          <label className="text-xs text-gray-500 block mb-1">Memo</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Optional note..."
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
            <span className="text-sm text-gray-500">Uploading...</span>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm">
              Drop files here or <span className="text-orange-500 font-medium">click to browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Images (jpg/png/webp) & PDFs, max 10MB each</p>
          </>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
    </div>
  );
}
