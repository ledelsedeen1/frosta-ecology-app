import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { translations } from '../translations';
import { Lang } from '../types';
import { DivingLogo } from '../components/DivingLogo';

export interface LoginViewProps {
  lang: Lang;
  onLogin: (email: string, password: string) => Promise<{ error: string | null }>;
  onRequestPasswordReset: (email: string) => Promise<{ error: string | null }>;
}

const copy = {
  no: {
    heading: 'Logg inn',
    description: 'Logg inn på dashbordet',
    email: 'E-post',
    password: 'Passord',
    submit: 'Logg inn',
    submitting: 'Logger inn...',
    forgotPassword: 'Glemt passord?',
    resetTitle: 'Tilbakestill passord',
    resetDescription: 'Skriv inn e-postadressen din, så sender vi en lenke for å lage et nytt passord.',
    resetSubmit: 'Send tilbakestillingslenke',
    resetSubmitting: 'Sender...',
    resetSuccess: 'Hvis kontoen finnes, er en tilbakestillingslenke sendt til e-postadressen.',
    resetError: 'Kunne ikke sende tilbakestillingslenke. Sjekk e-postadressen og prøv igjen.',
    backToLogin: 'Tilbake til innlogging',
  },
  pl: {
    heading: 'Zaloguj',
    description: 'Zaloguj się do panelu',
    email: 'E-mail',
    password: 'Hasło',
    submit: 'Zaloguj się',
    submitting: 'Logowanie...',
    forgotPassword: 'Nie pamiętasz hasła?',
    resetTitle: 'Reset hasła',
    resetDescription: 'Podaj adres e-mail, a wyślemy link do ustawienia nowego hasła.',
    resetSubmit: 'Wyślij link resetujący',
    resetSubmitting: 'Wysyłanie...',
    resetSuccess: 'Jeśli konto istnieje, link resetujący został wysłany na podany adres e-mail.',
    resetError: 'Nie udało się wysłać linku resetującego. Sprawdź adres e-mail i spróbuj ponownie.',
    backToLogin: 'Wróć do logowania',
  },
  en: {
    heading: 'Log in',
    description: 'Log in to dashboard',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    submitting: 'Signing in...',
    forgotPassword: 'Forgot password?',
    resetTitle: 'Reset password',
    resetDescription: 'Enter your email address and we will send a link to create a new password.',
    resetSubmit: 'Send reset link',
    resetSubmitting: 'Sending...',
    resetSuccess: 'If the account exists, a reset link has been sent to the email address.',
    resetError: 'Could not send the reset link. Check the email address and try again.',
    backToLogin: 'Back to login',
  },
};

export default function LoginView({ lang, onLogin, onRequestPasswordReset }: LoginViewProps) {
  const t = translations[lang] || translations.no;
  const text = copy[lang];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetMessage(null);
    setResetLoading(true);

    try {
      const result = await onRequestPasswordReset(email);
      if (result.error) {
        setResetError(text.resetError);
      } else {
        setResetMessage(text.resetSuccess);
      }
    } catch {
      setResetError(text.resetError);
    } finally {
      setResetLoading(false);
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
            {showPasswordReset ? text.resetTitle : 'Diving Ecology Education Frosta'}
          </h2>
          <p className="text-center text-slate-500 mb-8 font-medium">
            {showPasswordReset ? text.resetDescription : text.description}
          </p>

          {!showPasswordReset && error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {showPasswordReset && resetMessage && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
              {resetMessage}
            </div>
          )}

          {showPasswordReset && resetError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {resetError}
            </div>
          )}

          <form onSubmit={showPasswordReset ? handlePasswordReset : handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#0A2E36] mb-1.5">
                {text.email}
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
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {!showPasswordReset && <div>
              <label className="block text-sm font-semibold text-[#0A2E36] mb-1.5">
                {text.password}
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
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>}

            <button
              type="submit"
              disabled={loading || resetLoading}
              className="w-full flex items-center justify-center py-3 px-4 bg-[#0A2E36] hover:bg-[#124b57] text-white rounded-xl font-bold transition-colors shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {(loading || resetLoading) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {showPasswordReset ? text.resetSubmitting : text.submitting}
                </>
              ) : (
                showPasswordReset ? text.resetSubmit : text.submit
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setShowPasswordReset(value => !value);
              setError(null);
              setResetError(null);
              setResetMessage(null);
            }}
            className="mt-5 w-full text-sm font-bold text-[#278EA5] hover:underline"
          >
            {showPasswordReset ? text.backToLogin : text.forgotPassword}
          </button>

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
