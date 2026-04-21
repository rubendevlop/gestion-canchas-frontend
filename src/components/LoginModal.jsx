import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { ArrowRight, KeyRound, Mail, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, loginWithEmailPassword, loginWithGoogle } from '../firebase';
import { fetchAPI } from '../services/api';
import AppModal from './AppModal';
import BrandLogo from './BrandLogo';

// ── helpers ──────────────────────────────────────────────────────────────────
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
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ── component ─────────────────────────────────────────────────────────────────
/**
 * props:
 *   open        {boolean}   — whether the modal is visible
 *   onClose     {function}  — called when the user dismisses the modal
 */
export default function LoginModal({ open, onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [messageModal, setMessageModal] = useState(null);

  const openMsg = ({ title, description, tone = 'error' }) =>
    setMessageModal({ title, description, tone });
  const closeMsg = () => setMessageModal(null);

  const resetRegisterMarkers = () => {
    localStorage.removeItem('auth_intent');
    localStorage.removeItem('register_as');
  };

  // After a successful /users/login the AuthContext listener fires automatically.
  // The RoleRedirect in App.jsx (or any authenticated guard) will handle navigation.
  const handleEmailLogin = async () => {
    if (!normalizeEmail(form.email) || !form.password) {
      openMsg({ title: 'Faltan datos', description: 'Completa correo y contrasena.' });
      return;
    }
    setLoading(true);
    try {
      resetRegisterMarkers();
      await loginWithEmailPassword({ email: form.email, password: form.password });
      await fetchAPI('/users/login', { method: 'POST' });
      // AuthContext will receive the new auth state and navigate via RoleRedirect
      onClose();
    } catch (error) {
      try { await signOut(auth); } catch (_) {}
      openMsg({ title: 'No se pudo iniciar sesion', description: getLoginErrorMessage(error) });
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
        try { await signOut(auth); } catch (_) {}
        onClose();
        navigate('/register');
        return;
      }
      try { await signOut(auth); } catch (_) {}
      if (error.message !== 'popup-closed-by-user') {
        openMsg({ title: 'No se pudo iniciar sesion', description: getLoginErrorMessage(error) });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Iniciar sesión"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="relative w-full max-w-sm rounded-[2rem] border border-outline_variant/20 bg-white p-7 shadow-[0_32px_64px_-32px_rgba(20,32,22,0.32)]">
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-1 text-outline transition-colors hover:bg-surface_container hover:text-on_surface"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="mb-1 flex justify-center">
            <BrandLogo imageClassName="h-12 w-auto" />
          </div>
          <h2 className="mb-1 text-center text-2xl font-display font-bold text-on_surface">
            Bienvenido de nuevo
          </h2>
          <p className="mb-6 text-center text-sm text-on_surface_variant">
            Ingresa con tu correo o Google.
          </p>

          {/* Email form */}
          <div className="space-y-4 rounded-[1.5rem] border border-outline_variant/15 bg-surface_container_low p-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-outline">
                Correo
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-outline_variant" />
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-outline_variant/30 bg-white py-2.5 pl-10 pr-4 text-on_surface placeholder-outline_variant transition focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-outline">
                Contraseña
              </label>
              <div className="relative">
                <KeyRound size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-outline_variant" />
                <input
                  type="password"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                  className="w-full rounded-xl border border-outline_variant/30 bg-white py-2.5 pl-10 pr-4 text-on_surface placeholder-outline_variant transition focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={handleEmailLogin}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary_container to-primary py-3 font-semibold text-on_primary shadow-[0_10px_28px_-12px_rgba(47,158,68,0.34)] transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-on_primary/70 border-t-transparent" />
            ) : (
              <ArrowRight size={18} />
            )}
            {loading ? 'Procesando...' : 'Ingresar con email'}
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-outline_variant/20" />
            <span className="text-xs font-semibold uppercase tracking-wider text-outline">O continuar con</span>
            <div className="flex-1 border-t border-outline_variant/20" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-outline_variant/30 bg-white py-3 text-on_surface transition hover:bg-surface_container_low disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-outline_variant border-t-transparent" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? 'Procesando...' : 'Ingresar con Google'}
          </button>

          {/* Footer links */}
          <p className="mt-5 text-center text-sm text-on_surface_variant">
            ¿No tenés cuenta?{' '}
            <button
              type="button"
              onClick={() => { onClose(); navigate('/register'); }}
              className="font-semibold text-primary hover:underline"
            >
              Registrate
            </button>
          </p>
          <p className="mt-1 text-center text-sm text-on_surface_variant">
            ¿Tenés un complejo?{' '}
            <button
              type="button"
              onClick={() => { onClose(); navigate('/register?tipo=owner'); }}
              className="font-semibold text-secondary hover:underline"
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
        onClose={closeMsg}
      />
    </>
  );
}
