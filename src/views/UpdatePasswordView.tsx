import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { DivingLogo } from '../components/DivingLogo';
import { Lang } from '../types';

interface UpdatePasswordViewProps {
  lang: Lang;
  initialLinkError?: boolean;
  onUpdatePassword: (password: string) => Promise<{ error: string | null }>;
  onReturnToLogin: () => void;
}

const copy = {
  no: {
    title: 'Tilbakestill passord',
    newPassword: 'Nytt passord',
    repeatPassword: 'Gjenta passord',
    save: 'Lagre nytt passord',
    saving: 'Lagrer...',
    mismatch: 'Passordene er ikke like',
    minimum: 'Passordet må ha minst 8 tegn',
    success: 'Passordet er endret. Du kan nå logge inn.',
    error: 'Kunne ikke lagre det nye passordet. Be om en ny tilbakestillingslenke og prøv igjen.',
    linkError: 'Tilbakestillingslenken er ugyldig eller utløpt. Be om en ny lenke.',
    login: 'Logg inn',
  },
  pl: {
    title: 'Reset hasła',
    newPassword: 'Nowe hasło',
    repeatPassword: 'Powtórz hasło',
    save: 'Zapisz nowe hasło',
    saving: 'Zapisywanie...',
    mismatch: 'Hasła nie są takie same',
    minimum: 'Hasło musi mieć co najmniej 8 znaków',
    success: 'Hasło zostało zmienione. Możesz się teraz zalogować.',
    error: 'Nie udało się zapisać nowego hasła. Poproś o nowy link resetujący i spróbuj ponownie.',
    linkError: 'Link resetujący jest nieprawidłowy lub wygasł. Poproś o nowy link.',
    login: 'Zaloguj',
  },
  en: {
    title: 'Reset password',
    newPassword: 'New password',
    repeatPassword: 'Repeat password',
    save: 'Save new password',
    saving: 'Saving...',
    mismatch: 'Passwords do not match',
    minimum: 'Password must be at least 8 characters',
    success: 'Password has been changed. You can now log in.',
    error: 'Could not save the new password. Request a new reset link and try again.',
    linkError: 'The reset link is invalid or has expired. Request a new link.',
    login: 'Log in',
  },
};

export default function UpdatePasswordView({
  lang,
  initialLinkError = false,
  onUpdatePassword,
  onReturnToLogin,
}: UpdatePasswordViewProps) {
  const text = copy[lang];
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialLinkError ? text.linkError : '');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialLinkError) setError(text.linkError);
  }, [initialLinkError, text.linkError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError(text.minimum);
      return;
    }
    if (password !== repeatedPassword) {
      setError(text.mismatch);
      return;
    }

    setLoading(true);
    const result = await onUpdatePassword(password);
    setLoading(false);

    if (result.error) {
      setError(text.error);
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#278EA5]/20 bg-white p-7 shadow-xl">
        <div className="mb-6 flex justify-center">
          <DivingLogo />
        </div>
        <h1 className="text-center text-3xl font-black text-[#0A2E36]">{text.title}</h1>

        {success ? (
          <div className="mt-7 space-y-5">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-base font-medium text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{text.success}</p>
            </div>
            <button
              type="button"
              onClick={onReturnToLogin}
              className="min-h-12 w-full rounded-xl bg-[#0A2E36] px-4 py-3 text-base font-bold text-white"
            >
              {text.login}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-base font-medium text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <label className="block text-base font-bold text-[#0A2E36]">
              {text.newPassword}
              <span className="relative mt-2 block">
                <Lock className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="new-password"
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-base outline-none focus:border-[#278EA5] focus:ring-2 focus:ring-[#278EA5]"
                  required
                />
              </span>
            </label>

            <label className="block text-base font-bold text-[#0A2E36]">
              {text.repeatPassword}
              <span className="relative mt-2 block">
                <Lock className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  value={repeatedPassword}
                  onChange={event => setRepeatedPassword(event.target.value)}
                  autoComplete="new-password"
                  className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-base outline-none focus:border-[#278EA5] focus:ring-2 focus:ring-[#278EA5]"
                  required
                />
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || initialLinkError}
              className="min-h-12 w-full rounded-xl bg-[#0A2E36] px-4 py-3 text-base font-bold text-white disabled:bg-slate-300"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {text.saving}
                </span>
              ) : text.save}
            </button>
            {initialLinkError && (
              <button
                type="button"
                onClick={onReturnToLogin}
                className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-bold text-slate-700"
              >
                {text.login}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
