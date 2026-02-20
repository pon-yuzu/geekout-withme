import { useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase';
import { useTranslation } from '../i18n/index';

interface Props {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  isPremium: boolean;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export default function ProfileEditor({
  displayName: initialName,
  email,
  avatarUrl: initialAvatarUrl,
  isPremium,
  subscriptionStatus,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: Props) {
  const { t } = useTranslation();
  const supabase = createSupabaseBrowserClient();

  // Display name editing
  const [displayName, setDisplayName] = useState(initialName);
  const [editingName, setEditingName] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Billing portal
  const [billingLoading, setBillingLoading] = useState(false);

  const handleNameSave = async () => {
    if (!displayName.trim()) return;
    setNameSaving(true);
    setNameMsg('');

    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName.trim() },
    });

    if (error) {
      setNameMsg(error.message);
    } else {
      setNameMsg(t('profile.nameSaved'));
      setEditingName(false);
    }
    setNameSaving(false);
  };

  const compressToWebP = (file: File | Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 256;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d')!;
          const min = Math.min(img.width, img.height);
          const sx = (img.width - min) / 2;
          const sy = (img.height - min) / 2;
          ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
            'image/webp',
            0.8,
          );
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setAvatarMsg(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let imageFile: File | Blob = file;

      if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
        const heic2any = (await import('heic2any')).default;
        imageFile = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 }) as Blob;
      }

      const webpBlob = await compressToWebP(imageFile);
      const filePath = `${user.id}/avatar.webp`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, webpBlob, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: cacheBustedUrl })
        .eq('id', user.id);

      if (dbError) throw dbError;

      setAvatarUrl(cacheBustedUrl);
      setAvatarMsg({ type: 'success', text: t('profile.avatarUpdated') });
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setAvatarMsg({ type: 'error', text: t('profile.avatarError') });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: t('resetPassword.tooShort') });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: t('resetPassword.mismatch') });
      return;
    }

    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordMsg({ type: 'error', text: error.message });
    } else {
      setPasswordMsg({ type: 'success', text: t('profile.passwordChanged') });
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    }
    setPasswordSaving(false);
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {}
    setBillingLoading(false);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const initial = (displayName || email.split('@')[0]).charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Avatar + Name */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="relative w-20 h-20 rounded-full shrink-0 group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70"
            title={t('profile.changeAvatar')}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-bold">
                {initial}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div>
            {displayName && <p className="text-2xl font-bold text-gray-800">{displayName}</p>}
            <p className="text-gray-500">{email}</p>
            {avatarMsg && (
              <p className={`text-sm mt-1 ${avatarMsg.type === 'success' ? 'text-teal-500' : 'text-red-500'}`}>
                {avatarMsg.text}
              </p>
            )}
          </div>
        </div>

        {/* Display Name */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
            {t('profile.displayName')}
          </h2>
          {editingName ? (
            <div className="flex gap-3">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              <button
                onClick={handleNameSave}
                disabled={nameSaving}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {nameSaving ? '...' : t('profile.save')}
              </button>
              <button
                onClick={() => { setEditingName(false); setDisplayName(initialName); }}
                className="px-4 py-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {t('profile.cancel')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-lg text-gray-800">{displayName || '—'}</p>
              <button
                onClick={() => setEditingName(true)}
                className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
              >
                {t('profile.edit')}
              </button>
            </div>
          )}
          {nameMsg && <p className="text-sm text-teal-500 mt-2">{nameMsg}</p>}
        </div>

        {/* Email */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
            {t('profile.email')}
          </h2>
          <p className="text-lg text-gray-800">{email}</p>
        </div>

        {/* Password */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
            {t('profile.password')}
          </h2>
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
            >
              {t('profile.changePassword')}
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-3 max-w-sm">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('resetPassword.newPasswordPlaceholder')}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {passwordSaving ? '...' : t('profile.save')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPasswordForm(false); setNewPassword(''); setConfirmPassword(''); setPasswordMsg(null); }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  {t('profile.cancel')}
                </button>
              </div>
            </form>
          )}
          {passwordMsg && (
            <p className={`text-sm mt-2 ${passwordMsg.type === 'success' ? 'text-teal-500' : 'text-red-500'}`}>
              {passwordMsg.text}
            </p>
          )}
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('profile.subscription')}</h2>

        {isPremium ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                {t('profile.planActive')}
              </span>
              {cancelAtPeriodEnd && (
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                  {t('profile.cancelsAtEnd')}
                </span>
              )}
            </div>
            {currentPeriodEnd && (
              <p className="text-gray-500 mb-4">
                {cancelAtPeriodEnd ? t('profile.accessUntil') : t('profile.renewsOn')}{' '}
                <span className="text-gray-800 font-medium">{formatDate(currentPeriodEnd)}</span>
              </p>
            )}
            <button
              onClick={handleManageBilling}
              disabled={billingLoading}
              className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              {billingLoading ? t('pricing.loading') : t('profile.manageBilling')}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-500 mb-4">{t('profile.noPlan')}</p>
            <a
              href="/community"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              {t('profile.viewPlans')}
            </a>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="flex gap-4">
        <a
          href="/history"
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          {t('profile.viewHistory')}
        </a>
      </div>
    </div>
  );
}
