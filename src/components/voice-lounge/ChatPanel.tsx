import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../i18n/index';

export interface ChatMessage {
  type?: 'message' | 'image' | 'card' | 'timer_event' | 'translated_message';
  from: { id: string; name: string };
  message?: string;
  imageData?: string;
  // card
  category?: string;
  topic?: string;
  topicJa?: string;
  prompt?: string;
  vocab?: string[];
  // timer_event
  event?: 'start' | 'language_switch' | 'end';
  totalMinutes?: number;
  newLang?: 'ja' | 'en';
  // translated_message
  originalText?: string;
  translatedText?: string;
  originalLang?: 'ja' | 'en';
  timestamp: number;
}

interface Props {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSendImage: (imageData: string) => void;
  onSendTranslated?: (original: string, translated: string, originalLang: 'ja' | 'en') => void;
  currentUserId: string;
  isPremium?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  cooking: 'border-orange-400',
  travel: 'border-blue-400',
  anime: 'border-purple-400',
  tech: 'border-teal-400',
  music: 'border-pink-400',
  sports: 'border-green-400',
  daily: 'border-yellow-400',
};

function CardMessage({ msg }: { msg: ChatMessage }) {
  const { t } = useTranslation();
  const [showVocab, setShowVocab] = useState(false);
  const borderColor = CATEGORY_COLORS[msg.category || ''] || 'border-gray-400';

  return (
    <div className={`border-l-4 ${borderColor} bg-gray-50 rounded-lg p-3 max-w-[90%]`}>
      <div className="text-[10px] uppercase tracking-widest text-orange-500 font-semibold mb-1">
        {msg.category}
      </div>
      <div className="text-sm font-bold text-gray-800">{msg.topic}</div>
      {msg.topicJa && <div className="text-xs text-gray-500">{msg.topicJa}</div>}
      <div className="mt-2 bg-white rounded p-2 text-xs text-gray-700 leading-relaxed">
        {msg.prompt}
      </div>
      {msg.vocab && msg.vocab.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowVocab(!showVocab)}
            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600"
          >
            {showVocab ? '▾' : '▸'} {t('chat.vocabToggle')}
          </button>
          {showVocab && (
            <div className="flex flex-wrap gap-1 mt-1">
              {msg.vocab.map((v, i) => (
                <span key={i} className="bg-white rounded px-1.5 py-0.5 text-[10px] text-gray-600 border border-gray-200">
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TimerEventMessage({ msg }: { msg: ChatMessage }) {
  const { t } = useTranslation();
  let text = '';
  let icon = '';

  switch (msg.event) {
    case 'start':
      icon = '\u{1F550}';
      text = t('chat.timerStart', { name: msg.from.name, minutes: String(msg.totalMinutes || 20) });
      break;
    case 'language_switch':
      icon = '\u{1F504}';
      text = msg.newLang === 'ja' ? t('chat.timerSwitch.ja') : t('chat.timerSwitch.en');
      break;
    case 'end':
      icon = '\u23F0';
      text = t('chat.timerEnd');
      break;
  }

  return (
    <div className="text-center py-1">
      <span className="text-xs text-gray-400">
        {icon} {text}
      </span>
    </div>
  );
}

function TranslatedMessage({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) {
  const langFlag = msg.originalLang === 'ja' ? '\u{1F1EF}\u{1F1F5}' : '\u{1F1FA}\u{1F1F8}';
  const transFlag = msg.originalLang === 'ja' ? '\u{1F1FA}\u{1F1F8}' : '\u{1F1EF}\u{1F1F5}';

  return (
    <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
      isOwn ? 'bg-orange-50 text-gray-800' : 'bg-gray-100 text-gray-800'
    }`}>
      <p className="text-sm">{langFlag} {msg.originalText}</p>
      <p className="text-sm text-gray-500 mt-1">{transFlag} {msg.translatedText}</p>
    </div>
  );
}

export default function ChatPanel({ messages, onSendMessage, onSendImage, onSendTranslated, currentUserId, isPremium }: Props) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [translating, setTranslating] = useState(false);
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

  const handleTranslate = async () => {
    if (!input.trim() || !onSendTranslated) return;
    const text = input.trim();
    setTranslating(true);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('Translation failed');

      const { translatedText, originalLang } = await res.json();
      onSendTranslated(text, translatedText, originalLang);
      setInput('');
    } catch {
      alert(t('chat.translateError'));
      onSendMessage(text);
      setInput('');
    } finally {
      setTranslating(false);
    }
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

  const renderMessage = (msg: ChatMessage, i: number) => {
    // Timer events — system message style
    if (msg.type === 'timer_event') {
      return <TimerEventMessage key={i} msg={msg} />;
    }

    const isOwn = msg.from.id === currentUserId;

    // Card messages
    if (msg.type === 'card') {
      return (
        <div key={i} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          <span className="text-xs text-gray-500 mb-1">
            {msg.from.name} {t('chat.cardShared')}
          </span>
          <CardMessage msg={msg} />
          <span className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      );
    }

    // Translated messages
    if (msg.type === 'translated_message') {
      return (
        <div key={i} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          <span className="text-xs text-gray-500 mb-1">{msg.from.name}</span>
          <TranslatedMessage msg={msg} isOwn={isOwn} />
          <span className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      );
    }

    // Regular message / image
    return (
      <div key={i} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <span className="text-xs text-gray-500 mb-1">{msg.from.name}</span>
        <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
          isOwn ? 'bg-orange-50 text-gray-800' : 'bg-gray-100 text-gray-800'
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
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm" style={{ height: '550px' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">
            {t('chat.noMessages')}
          </p>
        )}
        {messages.map((msg, i) => renderMessage(msg, i))}
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
          {isPremium && onSendTranslated && (
            <button
              onClick={handleTranslate}
              disabled={!input.trim() || translating}
              className="w-10 h-10 flex items-center justify-center bg-teal-50 rounded-full text-teal-600 hover:bg-teal-100 transition-colors flex-shrink-0 disabled:opacity-50"
              title={t('chat.translate')}
            >
              {translating ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <span className="text-sm">{'\u{1F504}'}</span>
              )}
            </button>
          )}
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
