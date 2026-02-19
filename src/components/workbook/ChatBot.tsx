import { useState, useRef, useEffect } from 'react';
import type { ChatSession, ChatMessage } from '../../lib/workbook/types';
import { useTranslation } from '../../i18n/index';
import { SlotPreview } from './SlotPreview';
import { GenerationProgress } from './GenerationProgress';

const INITIAL_SESSION: ChatSession = {
  state: 'GREETING',
  slots: {},
  messages: [],
};

interface Props {
  autoLevel?: string | null;
  autoLevelLabel?: string | null;
}

export function ChatBot({ autoLevel, autoLevelLabel }: Props) {
  const { t } = useTranslation();
  const [session, setSession] = useState<ChatSession>(INITIAL_SESSION);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      fetchGreeting();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  async function fetchGreeting() {
    setLoading(true);
    try {
      const res = await fetch('/api/workbook/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '__greeting__',
          session: INITIAL_SESSION,
          autoLevel: autoLevel ?? undefined,
        }),
      });
      const data = await res.json();
      setSession({
        ...data.session,
        messages: [{ role: 'assistant', content: data.reply }],
      });
    } catch (err) {
      console.error('Greeting error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(text: string) {
    if (loading || !text) return;
    setLoading(true);

    const updatedMessages: ChatMessage[] = [
      ...session.messages,
      { role: 'user', content: text },
    ];
    setSession(prev => ({ ...prev, messages: updatedMessages }));
    setInput('');

    try {
      const res = await fetch('/api/workbook/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session: { ...session, messages: updatedMessages },
          autoLevel: autoLevel ?? undefined,
        }),
      });
      const data = await res.json();
      setSession({
        ...data.session,
        messages: [
          ...updatedMessages,
          { role: 'assistant', content: data.reply },
        ],
      });
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
  }

  if (session.state === 'GENERATING' || session.state === 'COMPLETE') {
    return <GenerationProgress slots={{ ...session.slots, isPublic }} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">
      {/* Auto-level hint */}
      {autoLevel && autoLevelLabel && !session.slots.level && (
        <div className="mx-4 mt-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-600">
          {t('workbook.chat.autoLevel')} <strong>{autoLevelLabel}</strong>
        </div>
      )}

      {/* Slot Preview */}
      {(session.slots.topic || session.slots.level || session.slots.destination) && (
        <SlotPreview slots={session.slots} />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {session.messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-gray-400">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Public/Private toggle */}
      {session.state === 'CONFIRM_SLOTS' && (
        <div className="mx-4 mb-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-gray-700">{t('workbook.visibility.label')}</div>
              <div className="text-xs text-gray-500">
                {isPublic ? t('workbook.visibility.publicDesc') : t('workbook.visibility.privateDesc')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublic ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('workbook.chat.placeholder')}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-orange-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('workbook.chat.send')}
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-wrap ${
          isUser
            ? 'bg-orange-500 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
