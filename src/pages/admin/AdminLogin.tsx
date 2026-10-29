import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useApp } from '../../context/AppContext';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, isLoading, error, clearError } = useAdminAuth();
  const { setCurrentRoute, t } = useApp();

  // Inputs are strictly EMPTY by default (no pre-filled credentials as requested)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setFormError(t('Please enter both email and password.', 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'));
      return;
    }

    await login(trimmedEmail, password);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-[#FAFAFA]">
      <div className="w-full max-w-md bg-white border border-zinc-200/80 rounded-2xl p-8 sm:p-10 shadow-xl shadow-zinc-200/40 space-y-8 backdrop-blur-md">
        
        {/* Brand Lockup */}
        <div className="text-center space-y-3">
          <button
            onClick={() => setCurrentRoute('home')}
            className="cursor-pointer group inline-block text-center focus-visible:outline-none"
            title="Return to Public Storefront"
          >
            <div className="relative inline-block">
              <img
                src="/assets/aistudio/Artistic_Touch_Gold_Badge_Logo_4af8445d.png"
                alt="Artistic Touch"
                className="w-16 h-16 rounded-full mx-auto border-2 border-[#C6A15B]/60 shadow-md group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center text-white text-[10px]">
                <Lock className="w-2.5 h-2.5" />
              </span>
            </div>
            <div className="mt-3">
              <h1 className="font-serif text-2xl font-bold text-zinc-900 tracking-tight group-hover:text-rose-600 transition-colors">
                Artistic Touch <span className="font-script text-rose-500 font-normal">#Hager</span>
              </h1>
              <p className="text-xs text-zinc-500 mt-1 font-medium tracking-wide">
                {t('Private Atelier Management Portal', 'بوابة الإدارة الخاصة بالمرسم')}
              </p>
            </div>
          </button>
        </div>

        {/* Error Alert */}
        {(error || formError) && (
          <div className="p-3.5 bg-rose-50/80 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{error || formError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700">
              {t('Administrator Email', 'البريد الإلكتروني للمسؤول')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none rtl:left-auto rtl:right-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@artistictouch.com"
                required
                autoComplete="email"
                className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700">
              {t('Password', 'كلمة المرور')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none rtl:left-auto rtl:right-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-9 pr-10 rtl:pr-9 rtl:pl-10 py-2.5 bg-zinc-50/50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 focus:outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors rtl:right-auto rtl:left-3"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer w-full py-3.5 px-4 bg-zinc-950 text-white text-xs font-semibold rounded-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span>{isLoading ? t('Verifying credentials...', 'جارٍ التحقق من الهوية...') : t('Sign In to Dashboard', 'دخول لوحة التحكم')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-zinc-100">
          <button
            onClick={() => setCurrentRoute('home')}
            className="cursor-pointer text-xs font-medium text-zinc-500 hover:text-rose-600 transition-colors"
          >
            {t('← Return to Public Website', '← العودة إلى الموقع الرئيسي')}
          </button>
        </div>
      </div>
    </div>
  );
};
