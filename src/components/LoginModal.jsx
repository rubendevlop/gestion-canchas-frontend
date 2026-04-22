import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { ArrowRight, KeyRound, Mail, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, loginWithEmailPassword, loginWithGoogle } from '../firebase';
import { fetchAPI } from '../services/api';
import AppModal from './AppModal';
import BrandLogo from './BrandLogo';

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function getLoginErrorMessage(error) {
  if (
    error?.code === 'USER_NOT_REGISTERED' ||
    error?.data?.error === 'USER_NOT_REGISTERED'
  ) {
    return 'Debes registrarte antes de iniciar sesion.';
  }

  return error?.message || 'Intenta de nuevo.';
}

function isUserNotRegisteredError(error) {
  return (
    error?.code === 'USER_NOT_REGISTERED' ||
    error?.data?.error === 'USER_NOT_REGISTERED'
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginModal({ open, onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [messageModal, setMessageModal] = useState(null);

  const openMessageModal = ({ title, description, tone = 'error' }) => {
    setMessageModal({ title, description, tone });
  };

  const closeMessageModal = () => {
    setMessageModal(null);
  };

  const resetRegisterMarkers = () => {
    localStorage.removeItem('auth_intent');
    localStorage.removeItem('register_as');
  };

  const handleEmailLogin = async () => {
    if (!normalizeEmail(form.email) || !form.password) {
      openMessageModal({
        title: 'Faltan datos',
        description: 'Completa correo y contrasena.',
      });
      return;
    }

    setLoading(true);

    try {
      resetRegisterMarkers();
      await loginWithEmailPassword({ email: form.email, password: form.password });
      await fetchAPI('/users/login', { method: 'POST' });
      onClose();
    } catch (error) {
      try {
        await signOut(auth);
      } catch (_) {
        // noop
      }

      openMessageModal({
        title: 'No se pudo iniciar sesion',
        description: getLoginErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      resetRegisterMarkers();
      await loginWithGoogle();
      await fetchAPI('/users/login', { method: 'POST' });
      onClose();
    } catch (error) {
      if (isUserNotRegisteredError(error)) {
        try {
          await signOut(auth);
        } catch (_) {
          // noop
        }

        onClose();
        navigate('/register');
        return;
      }

      try {
        await signOut(auth);
      } catch (_) {
        // noop
      }

      if (error.message !== 'popup-closed-by-user') {
        openMessageModal({
          title: 'No se pudo iniciar sesion',
          description: getLoginErrorMessage(error),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Iniciar sesion"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-[#9dff53]/18 bg-[linear-gradient(180deg,rgba(4,18,30,0.98),rgba(5,16,26,0.94))] p-7 text-white shadow-[0_38px_90px_-38px_rgba(123,255,86,0.42)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(123,255,86,0.18),transparent_68%)]" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>

          <div className="mb-1 flex justify-center">
            <BrandLogo imageClassName="h-12 w-auto" />
          </div>
          <h2 className="mb-1 text-center text-2xl font-display font-bold text-on_surface">
            Bienvenido de nuevo
          </h2>
          <p className="mb-6 text-center text-sm text-slate-300">
            Ingresa con tu correo o con Google.
          </p>

          <div className="space-y-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#bbff9f]">
                Correo
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91ff54]"
                />
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#071523] py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 transition focus:border-[#8eff47]/40 focus:outline-none focus:ring-4 focus:ring-[#8eff47]/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#bbff9f]">
                Contrasena
              </label>
              <div className="relative">
                <KeyRound
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91ff54]"
                />
                <input
                  type="password"
                  placeholder="Tu contrasena"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleEmailLogin();
                    }
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#071523] py-2.5 pl-10 pr-4 text-white placeholder:text-slate-500 transition focus:border-[#8eff47]/40 focus:outline-none focus:ring-4 focus:ring-[#8eff47]/10"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEmailLogin}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#7CFF4B_0%,#58d832_55%,#9dcf20_100%)] py-3 font-semibold text-[#08110d] shadow-[0_18px_44px_-18px_rgba(123,255,86,0.75)] transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#08110d]/50 border-t-transparent" />
            ) : (
              <ArrowRight size={18} />
            )}
            {loading ? 'Procesando...' : 'Ingresar con email'}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              O continuar con
            </span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] py-3 text-white transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? 'Procesando...' : 'Ingresar con Google'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-300">
            No tenes cuenta?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/register');
              }}
              className="font-semibold text-[#8eff47] hover:underline"
            >
              Registrate
            </button>
          </p>
          <p className="mt-1 text-center text-sm text-slate-300">
            Tenes un complejo?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/register?tipo=owner');
              }}
              className="font-semibold text-[#8eff47] hover:underline"
            >
              Registrar mi complejo
            </button>
          </p>
        </div>
      </div>

      <AppModal
        open={Boolean(messageModal)}
        title={messageModal?.title || ''}
        description={messageModal?.description || ''}
        tone={messageModal?.tone || 'error'}
        onClose={closeMessageModal}
      />
    </>
  );
}
