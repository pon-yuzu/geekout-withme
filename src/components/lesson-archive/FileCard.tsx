interface FileCardProps {
  file: {
    id: string;
    file_name: string;
    file_type: 'image' | 'pdf';
    file_size_bytes: number;
    memo: string | null;
    is_pinned: boolean;
    uploaded_by: string;
    url: string;
    created_at: string;
  };
  canDelete: boolean;
  canPin: boolean;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileCard({ file, canDelete, canPin, onDelete, onTogglePin }: FileCardProps) {
  return (
    <div className={`bg-white rounded-xl border p-3 flex gap-3 items-start ${file.is_pinned ? 'border-teal-300 bg-teal-50/30' : 'border-gray-200'}`}>
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {file.file_type === 'image' && file.url ? (
          <img src={file.url} alt={file.file_name} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <span className="text-2xl">{file.file_type === 'pdf' ? '📄' : '🖼️'}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {file.is_pinned && <span className="text-xs">📌</span>}
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-800 hover:text-orange-500 truncate block"
          >
            {file.file_name}
          </a>
        </div>
        {file.memo && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{file.memo}</p>
        )}
        <p className="text-[10px] text-gray-400 mt-1">{formatSize(file.file_size_bytes)}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
          title="Download"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </a>
        {canPin && (
          <button
            onClick={() => onTogglePin(file.id, !file.is_pinned)}
            className={`p-1.5 rounded-lg transition-colors ${file.is_pinned ? 'text-teal-500 hover:bg-teal-50' : 'text-gray-400 hover:text-teal-500 hover:bg-teal-50'}`}
            title={file.is_pinned ? 'Unpin' : 'Pin'}
          >
            <svg className="w-4 h-4" fill={file.is_pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(file.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
