import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { translations } from '../translations';
import { Lang } from '../types';
import { DivingLogo } from '../components/DivingLogo';

export interface LoginViewProps {
  lang: Lang;
  onLogin: (email: string, password: string) => Promise<{ error: string | null }>;
}

export default function LoginView({ lang, onLogin }: LoginViewProps) {
  const t = translations[lang] || translations.no;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const res = await onLogin(email, password);
      if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-[#278EA5]/20">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <DivingLogo />
          </div>
          <h2 className="text-2xl font-bold text-center text-[#0A2E36] mb-2">
            Diving Ecology Education Frosta
          </h2>
          <p className="text-center text-slate-500 mb-8 font-medium">
            {lang === 'pl' ? 'Zaloguj się do panelu' : lang === 'en' ? 'Log in to dashboard' : 'Logg inn på dashbordet'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#0A2E36] mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#278EA5] focus:border-[#278EA5] transition-all outline-none"
                  placeholder="admin@frostadiving.no"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0A2E36] mb-1.5">
                {lang === 'pl' ? 'Hasło' : lang === 'en' ? 'Password' : 'Passord'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#278EA5] focus:border-[#278EA5] transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 bg-[#0A2E36] hover:bg-[#124b57] text-white rounded-xl font-bold transition-colors shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                lang === 'pl' ? 'Zaloguj się' : lang === 'en' ? 'Sign in' : 'Logg inn'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Diving Ecology Education Frosta • Organization Panel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
