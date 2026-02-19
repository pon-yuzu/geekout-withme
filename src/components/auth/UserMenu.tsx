import { useState, useRef, useEffect } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase';
import { useTranslation } from '../../i18n/index';

interface UserMenuProps {
  email: string;
  displayName?: string;
}

export default function UserMenu({ email, displayName }: UserMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const supabase = createSupabaseBrowserClient();

  const name = displayName || email.split('@')[0];
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
          {initial}
        </div>
        <span className="text-sm font-medium hidden sm:inline">{name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>
          <div className="py-1">
            <a
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-orange-50 transition-colors"
            >
              {t('userMenu.profile')}
            </a>
            <a
              href="/history"
              className="block px-4 py-2 text-sm text-gray-600 hover:bg-orange-50 transition-colors"
            >
              {t('userMenu.history')}
            </a>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              {t('userMenu.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
