import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { SiteSettings } from '../../types';
import { Save, Lock, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { token } = useAdminAuth();
  const { refreshSettings } = useApp();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !settings) return;

    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const updated = await api.updateAdminSettings(token, settings);
      setSettings(updated);
      await refreshSettings();
      setStatusMessage('Website settings successfully saved and applied.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setPasswordStatus(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changeAdminPassword(token, currentPassword, newPassword);
      setPasswordStatus('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="py-16 text-center text-xs text-[#302A2D]/60">
        Loading site settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#302A2D]">
          Website Content & Settings
        </h2>
        <p className="text-xs text-[#302A2D]/60 mt-0.5">
          Edit brand text, announcements, WhatsApp numbers, social links, and security credentials.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Announcement Bar */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#302A2D]">
            Top Announcement Bar
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcement_bar_enabled}
                onChange={e => setSettings({ ...settings, announcement_bar_enabled: e.target.checked })}
                className="rounded text-[#E85D8A]"
              />
              <span className="font-medium text-[#302A2D]">Enable Announcement Bar</span>
            </label>

            <div>
              <label className="block text-[#302A2D]/70 font-semibold mb-1">
                Announcement Text (English)
              </label>
              <input
                type="text"
                value={settings.announcement_bar_text}
                onChange={e => setSettings({ ...settings, announcement_bar_text: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#302A2D]/70 font-semibold mb-1">
                نص الإعلان (بالعربية)
              </label>
              <input
                type="text"
                value={settings.announcement_bar_text_ar || ''}
                onChange={e => setSettings({ ...settings, announcement_bar_text_ar: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Hero Section Content */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#302A2D]">
            Homepage Hero Content
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#302A2D]/70 font-semibold mb-1">
                Headline (English)
              </label>
              <input
                type="text"
                value={settings.hero_headline}
                onChange={e => setSettings({ ...settings, hero_headline: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#302A2D]/70 font-semibold mb-1">
                العنوان الرئيسي (بالعربية)
              </label>
              <input
                type="text"
                value={settings.hero_headline_ar}
                onChange={e => setSettings({ ...settings, hero_headline_ar: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#302A2D]/70 font-semibold mb-1">
                Subheadline (English)
              </label>
              <textarea
                rows={2}
                value={settings.hero_subheadline}
                onChange={e => setSettings({ ...settings, hero_subheadline: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-[#302A2D]/70 font-semibold mb-1">
                العنوان الفرعي (بالعربية)
              </label>
              <textarea
                rows={2}
                value={settings.hero_subheadline_ar}
                onChange={e => setSettings({ ...settings, hero_subheadline_ar: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Brand Story & Philosophy */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#302A2D]">
            Brand Story & Philosophy (About Page & Footer)
          </h3>
          <div>
            <label className="block text-[#302A2D]/70 font-semibold mb-1">
              Brand Story (English)
            </label>
            <textarea
              rows={3}
              value={settings.brand_story}
              onChange={e => setSettings({ ...settings, brand_story: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-[#302A2D]/70 font-semibold mb-1">
              قصة العلامة الفنية (بالعربية)
            </label>
            <textarea
              rows={3}
              value={settings.brand_story_ar}
              onChange={e => setSettings({ ...settings, brand_story_ar: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Contact Channels & WhatsApp */}
        <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#302A2D]">
            Contact Channels & WhatsApp Ordering
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#302A2D]/70 font-semibold mb-1">
                WhatsApp Number (for instant orders & inquiries) *
              </label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="+201023456789"
                className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[#302A2D]/70 font-semibold mb-1">
                Display Phone Number
              </label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#302A2D]/70 font-semibold mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#302A2D]/70 font-semibold mb-1">
                Studio Address / Location
              </label>
              <input
                type="text"
                value={settings.contact_address}
                onChange={e => setSettings({ ...settings, contact_address: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[#302A2D]/70 font-semibold mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={settings.instagram_url}
                onChange={e => setSettings({ ...settings, instagram_url: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#302A2D]/70 font-semibold mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                value={settings.facebook_url}
                onChange={e => setSettings({ ...settings, facebook_url: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="cursor-pointer py-3 px-6 bg-[#302A2D] text-[#FFF9F0] text-xs font-semibold rounded-lg hover:bg-black transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Website Settings...' : 'Save Website Settings'}</span>
        </button>
      </form>

      {/* Security: Change Admin Password */}
      <div className="bg-[#FFFDF9] border border-[#EBDCCF] rounded-2xl p-6 shadow-xs space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#C6A15B]" />
          <h3 className="font-serif text-base font-bold text-[#302A2D]">
            Administrator Security (Change Password)
          </h3>
        </div>

        {passwordStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordStatus}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs max-w-md">
          <div>
            <label className="block text-[#302A2D]/70 font-semibold mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[#302A2D]/70 font-semibold mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[#302A2D]/70 font-semibold mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-white border border-[#EBDCCF] rounded-lg text-[#302A2D] focus:border-[#C6A15B] focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="cursor-pointer py-2.5 px-4 bg-[#302A2D] text-[#FFF9F0] text-xs font-semibold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            {isChangingPassword ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
