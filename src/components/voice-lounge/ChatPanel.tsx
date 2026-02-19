import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../i18n/index';

interface ChatMessage {
  from: { id: string; name: string };
  message?: string;
  imageData?: string;
  timestamp: number;
}

interface Props {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSendImage: (imageData: string) => void;
  currentUserId: string;
}

export default function ChatPanel({ messages, onSendMessage, onSendImage, currentUserId }: Props) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (composingRef.current) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const compressImage = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 1200;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height / width) * maxSize);
              width = maxSize;
            } else {
              width = Math.round((width / height) * maxSize);
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let imageFile: File | Blob = file;

      if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
        const heic2any = (await import('heic2any')).default;
        imageFile = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 }) as Blob;
      }

      const dataUrl = await compressImage(imageFile);

      if (dataUrl.length > 1_000_000) {
        alert(t('chat.imageTooLarge'));
        return;
      }

      onSendImage(dataUrl);
    } catch (err) {
      console.error('Image processing error:', err);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm" style={{ height: '400px' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">
            {t('chat.noMessages')}
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.from.id === currentUserId ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-500 mb-1">{msg.from.name}</span>
            <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
              msg.from.id === currentUserId
                ? 'bg-orange-50 text-gray-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.imageData ? (
                <img src={msg.imageData} alt="" className="max-w-full rounded-lg" loading="lazy" />
              ) : (
                <p className="text-sm">{msg.message}</p>
              )}
            </div>
            <span className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex gap-2 items-center">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors flex-shrink-0"
            title="Send image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionEnd={() => { composingRef.current = false; }}
            placeholder={t('chat.placeholder')}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm focus:outline-none focus:border-orange-500 focus:ring-orange-500 text-gray-800 placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {t('chat.send')}
          </button>
        </div>
      </div>
    </div>
  );
}
