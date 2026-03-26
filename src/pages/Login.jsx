import { useState } from 'react';
import { signOut } from 'firebase/auth';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Cookie,
  ExternalLink,
  Lock,
  Mail,
  Shield,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { auth, loginWithGoogle } from '../firebase';
import { fetchAPI } from '../services/api';
import BrandLogo from '../components/BrandLogo';
import LoginHeroArtwork from '../components/LoginHeroArtwork';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cookieBannerDismissed, setCookieBannerDismissed] = useState(
    () => !!localStorage.getItem('cookies_accepted'),
  );

  const isRegistering = mode !== 'login';

  const handleRegisterIntent = () => {
    if (!termsAccepted) {
      alert('Debes aceptar los Terminos y Condiciones para continuar.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmedRegister = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      localStorage.setItem('auth_intent', 'register');
      localStorage.setItem('register_as', mode === 'register-owner' ? 'owner' : 'client');

      await loginWithGoogle();

      const registerAs = mode === 'register-owner' ? 'owner' : 'client';
      await fetchAPI('/users/register', {
        method: 'POST',
        body: JSON.stringify({ registerAs }),
      });

      localStorage.removeItem('auth_intent');
      localStorage.removeItem('register_as');
      sessionStorage.removeItem('role');
      await signOut(auth);

      setRegisteredSuccess(true);
      setMode('login');
      setTermsAccepted(false);
    } catch (error) {
      console.error('Error en registro:', error);
      localStorage.removeItem('auth_intent');
      localStorage.removeItem('register_as');

      try {
        await signOut(auth);
      } catch (_) {
        // noop
      }

      if (!error.message?.includes('popup-closed')) {
        alert(`Error al registrarse: ${error.message || 'Intenta de nuevo.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      localStorage.removeItem('auth_intent');
      localStorage.removeItem('register_as');
      await loginWithGoogle();
    } catch (error) {
      if (!error.message?.includes('popup-closed')) {
        alert(`Error al iniciar sesion: ${error.message || 'Intenta de nuevo.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const acceptCookies = () => {
    localStorage.setItem('cookies_accepted', '1');
    setCookieBannerDismissed(true);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background text-on_surface font-body lg:flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-outline_variant/25 bg-[linear-gradient(155deg,#ffffff,#f1f8e8)]">
        <div className="absolute inset-0 opacity-35 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_108px,rgba(123,207,82,0.08)_108px,rgba(123,207,82,0.08)_216px)] pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary/14 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-secondary/14 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex h-full w-full flex-col px-12 py-10">
          <BrandLogo imageClassName="h-20 w-auto" />

          <div className="relative min-h-[25rem] flex-1">
            <LoginHeroArtwork className="absolute inset-x-[-4rem] bottom-[-4rem] top-2" />
          </div>

          <div className="relative z-10 max-w-[38rem] pb-6">
            <h1 className="mb-6 text-5xl font-display font-bold leading-[0.95] tracking-tight text-on_surface">
              Gestiona tu complejo con claridad.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-on_surface_variant">
              Gestiona canchas, reservas y ventas desde un solo lugar. Simple, moderno y sin complicaciones.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {['Canchas', 'Reservas', 'Tienda', 'Multi-complejo'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-outline_variant/15 bg-white/80 px-4 py-2 text-sm text-on_surface_variant shadow-[0_10px_20px_-18px_rgba(24,36,24,0.24)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(123,207,82,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(242,177,52,0.12),transparent_28%),linear-gradient(180deg,#fcfef9,#f7faf4)] p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo imageClassName="h-16 w-auto" />
          </div>

          {registeredSuccess && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-semibold text-green-600">Cuenta creada con exito</p>
                <p className="mt-0.5 text-xs text-green-700/80">
                  Inicia sesion con tus credenciales para acceder.
                </p>
              </div>
            </div>
          )}

          <div className="mb-8 text-center lg:text-left">
            <h2 className="mb-2 text-3xl font-display font-bold">
              {mode === 'login' && 'Bienvenido de nuevo'}
              {mode === 'register-client' && 'Crear cuenta de cliente'}
              {mode === 'register-owner' && 'Registrar mi complejo'}
            </h2>
            <p className="text-on_surface_variant">
              {mode === 'login' && 'Ingresa para acceder a tu panel.'}
              {mode === 'register-client' && 'Reserva canchas y compra en segundos.'}
              {mode === 'register-owner' && 'Empieza a gestionar tus canchas hoy.'}
            </p>
          </div>

          {isRegistering && (
            <div className="mb-6 grid grid-cols-2 gap-3">
              <AccountTypeCard
                icon={<Users size={22} />}
                title="Soy cliente"
                desc="Quiero reservar canchas"
                active={mode === 'register-client'}
                onClick={() => setMode('register-client')}
              />
              <AccountTypeCard
                icon={<Building2 size={22} />}
                title="Soy dueno"
                desc="Tengo un complejo"
                active={mode === 'register-owner'}
                onClick={() => setMode('register-owner')}
              />
            </div>
          )}

          <div className="space-y-4">
            {isRegistering && (
              <FormField
                icon={<UserIcon size={18} />}
                placeholder={mode === 'register-owner' ? 'Nombre del complejo' : 'Tu nombre'}
                label="Nombre"
              />
            )}

            <FormField
              icon={<Mail size={18} />}
              placeholder="ejemplo@correo.com"
              label="Correo electronico"
              type="email"
            />
            <FormField
              icon={<Lock size={18} />}
              placeholder="........"
              label="Contrasena"
              type="password"
            />

            {isRegistering && (
              <label className="group mt-2 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                />
                <span className="text-xs leading-relaxed text-on_surface_variant">
                  Al registrarme acepto los{' '}
                  <button
                    type="button"
                    onClick={() => alert('Terminos y Condiciones: version demo.')}
                    className="text-primary underline underline-offset-2 transition-colors hover:text-primary_fixed"
                  >
                    Terminos y Condiciones
                  </button>{' '}
                  y la{' '}
                  <button
                    type="button"
                    onClick={() => alert('Politica de Privacidad: version demo.')}
                    className="text-primary underline underline-offset-2 transition-colors hover:text-primary_fixed"
                  >
                    Politica de Privacidad
                  </button>
                  .
                </span>
              </label>
            )}

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                alert('El acceso por email estara disponible pronto. Usa Google por ahora.');
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary_container to-primary py-3 font-semibold text-on_primary shadow-[0_10px_28px_-12px_rgba(47,158,68,0.34)] transition-all hover:brightness-110 disabled:opacity-50"
              disabled={loading}
            >
              {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="my-6 flex items-center before:flex-1 before:border-t before:border-outline_variant/20 after:flex-1 after:border-t after:border-outline_variant/20">
            <span className="px-4 text-xs font-semibold uppercase tracking-wider text-outline">
              O continuar con
            </span>
          </div>

          <button
            type="button"
            onClick={isRegistering ? handleRegisterIntent : handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-outline_variant/30 bg-white py-3 text-on_surface transition-colors hover:bg-surface_container_low disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-on_surface_variant border-t-transparent" />
            ) : (
              <GoogleIcon />
            )}
            {loading
              ? 'Procesando...'
              : mode === 'login'
                ? 'Ingresar con Google'
                : mode === 'register-owner'
                  ? 'Registrar complejo con Google'
                  : 'Registrarse con Google'}
          </button>

          <p className="mt-6 text-center text-sm text-on_surface_variant">
            {isRegistering ? 'Ya tienes cuenta?' : 'No tienes cuenta?'}
            <button
              type="button"
              onClick={() => {
                setMode(isRegistering ? 'login' : 'register-client');
                setTermsAccepted(false);
                setRegisteredSuccess(false);
              }}
              className="ml-2 border-none bg-transparent p-0 font-semibold text-primary hover:underline"
            >
              {isRegistering ? 'Iniciar sesion' : 'Registrarse'}
            </button>
          </p>

          {mode === 'login' && (
            <p className="mt-1 text-center text-sm text-on_surface_variant">
              Tienes un complejo?
              <button
                type="button"
                onClick={() => setMode('register-owner')}
                className="ml-2 border-none bg-transparent p-0 font-semibold text-secondary hover:underline"
              >
                Registrar mi complejo
              </button>
            </p>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-outline_variant/25 bg-white p-8 shadow-[0_26px_70px_-32px_rgba(24,36,24,0.28)]">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-4 top-4 text-outline transition-colors hover:text-on_surface"
            >
              <X size={20} />
            </button>

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Shield size={28} className="text-primary" />
            </div>

            <h3 className="mb-2 text-center text-xl font-display font-bold text-on_surface">
              Confirma tu registro
            </h3>
            <p className="mb-6 text-center text-sm text-on_surface_variant">
              Vas a crear una cuenta como{' '}
              <span className="font-semibold text-primary">
                {mode === 'register-owner' ? 'Dueno de Complejo' : 'Cliente'}
              </span>
              . Se abrira Google para autenticarte.
            </p>

            <div className="mb-6 space-y-2 rounded-2xl bg-surface_container p-4 text-xs text-on_surface_variant">
              <p className="flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                Tus datos se guardan de forma segura
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                Puedes cancelar en cualquier momento
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                Luego deberas iniciar sesion manualmente
              </p>
            </div>

            <button
              type="button"
              onClick={handleConfirmedRegister}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary_container to-primary py-3.5 font-bold text-on_primary transition-all hover:brightness-110"
            >
              <GoogleIcon /> Continuar con Google
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="mt-3 w-full py-2 text-center text-sm text-outline transition-colors hover:text-on_surface"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!cookieBannerDismissed && (
        <div className="fixed bottom-4 left-4 right-4 z-40 rounded-2xl border border-outline_variant/25 bg-white p-5 shadow-[0_26px_60px_-34px_rgba(24,36,24,0.28)] md:left-auto md:right-6 md:max-w-sm">
          <div className="mb-4 flex items-start gap-3">
            <Cookie size={20} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-on_surface">Usamos cookies</p>
              <p className="mt-1 text-xs leading-relaxed text-on_surface_variant">
                Utilizamos cookies para mejorar tu experiencia y mantener tu sesion activa.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={acceptCookies}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-on_primary_fixed transition-all hover:brightness-110"
            >
              Aceptar
            </button>
            <button
              type="button"
              onClick={() => {
                alert('Politica de cookies: version demo.');
              }}
              className="flex items-center gap-1 px-3 text-sm text-outline transition-colors hover:text-on_surface"
            >
              Mas info <ExternalLink size={12} />
            </button>
            <button
              type="button"
              onClick={() => setCookieBannerDismissed(true)}
              className="p-1 text-outline transition-colors hover:text-on_surface"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountTypeCard({ icon, title, desc, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-outline_variant/25 bg-white text-on_surface_variant hover:border-primary/40 hover:text-on_surface'
      }`}
    >
      <div className={active ? 'text-primary' : 'text-outline'}>{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs opacity-70">{desc}</p>
      </div>
    </button>
  );
}

function FormField({ icon, placeholder, label, type = 'text' }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.03em] text-outline">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-outline_variant">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          className="w-full rounded-xl border border-outline_variant/30 bg-white py-3 pl-12 pr-4 text-on_surface placeholder-outline_variant transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
        />
      </div>
    </div>
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
