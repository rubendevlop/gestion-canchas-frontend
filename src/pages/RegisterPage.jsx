import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  Globe,
  KeyRound,
  LayoutGrid,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { auth, loginWithGoogle, registerWithEmailPassword } from '../firebase';
import AppModal from '../components/AppModal';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../contexts/AuthContext';
import { fetchAPI } from '../services/api';

const OWNER_FORM_INITIAL = {
  fullName: '',
  contactPhone: '',
  documentType: 'DNI',
  documentNumber: '',
  complexName: '',
  complexAddress: '',
  city: '',
  courtsCount: '1',
  sportsOffered: '',
  websiteOrInstagram: '',
  notes: '',
};

const CLIENT_FORM_INITIAL = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
};

const GOOGLE_CLIENT_FORM_INITIAL = {
  username: '',
  email: '',
  phone: '',
};

const REGISTER_BENEFITS = {
  client: [
    {
      icon: Users,
      title: 'Reserva sin friccion',
      description: 'Encuentra horarios, productos y complejos desde una sola cuenta.',
    },
    {
      icon: Shield,
      title: 'Acceso claro y seguro',
      description: 'Ingresa con email o Google y mantene tu historial siempre ordenado.',
    },
    {
      icon: LayoutGrid,
      title: 'Todo en el mismo lugar',
      description: 'Tus reservas, compras y datos quedan listos para usar desde el portal.',
    },
  ],
  owner: [
    {
      icon: Building2,
      title: 'Muestra tu complejo mejor',
      description: 'Publica canchas, precios y disponibilidad con una vidriera mas profesional.',
    },
    {
      icon: LayoutGrid,
      title: 'Gestion centralizada',
      description: 'Organiza reservas, canchas y datos del negocio desde un panel unico.',
    },
    {
      icon: Shield,
      title: 'Alta validada',
      description: 'La autenticacion con Google ayuda a dar confianza al proceso de registro.',
    },
  ],
};

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function isValidArgentinaPhone(value = '') {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return false;
  }

  let normalized = digits;
  if (normalized.startsWith('549')) {
    normalized = normalized.slice(3);
  } else if (normalized.startsWith('54')) {
    normalized = normalized.slice(2);
  } else if (normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }

  return normalized.length >= 10 && normalized.length <= 11;
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

function FormField({
  icon,
  placeholder,
  label,
  type = 'text',
  value = '',
  onChange = () => {},
  textarea = false,
  autoComplete,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.03em] text-outline">
        {label}
      </label>
      <div className="relative">
        <div
          className={`pointer-events-none absolute left-0 text-brand_gray/70 ${
            textarea ? 'top-3.5 pl-4' : 'inset-y-0 flex items-center pl-4'
          }`}
        >
          {icon}
        </div>
        {textarea ? (
          <textarea
            rows={4}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className={`w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-12 pr-4 text-white placeholder-brand_gray/60 transition focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 ${
              disabled ? 'cursor-not-allowed opacity-70' : ''
            }`}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            autoComplete={autoComplete}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className={`w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-12 pr-4 text-white placeholder-brand_gray/60 transition focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 ${
              disabled ? 'cursor-not-allowed opacity-70' : ''
            }`}
          />
        )}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.03em] text-outline">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white transition focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function AccountTypeCard({ icon, title, desc, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-[1.4rem] border p-4 text-left transition-all ${
        active
          ? 'border-primary/30 bg-[linear-gradient(135deg,rgb(var(--primary-green-rgb)/0.18),rgb(var(--primary-green-rgb)/0.04))] text-white shadow-[0_18px_38px_-28px_rgb(var(--primary-green-rgb)/0.3)]'
          : 'border-white/10 bg-white/[0.04] text-brand_gray hover:border-primary/30 hover:text-white'
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          active ? 'bg-primary/14 text-primary' : 'bg-white/[0.06] text-brand_gray'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${active ? 'text-white' : ''}`}>{title}</p>
        <p className="mt-0.5 text-xs leading-5 opacity-80">{desc}</p>
      </div>
    </button>
  );
}

function RegisterBenefitCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/14 text-primary">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 font-['Barlow_Condensed'] text-2xl uppercase text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-brand_white/72">{description}</p>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role, loading: authLoading } = useAuth();

  const [mode, setMode] = useState(
    searchParams.get('tipo') === 'owner' ? 'register-owner' : 'register-client',
  );
  const [clientForm, setClientForm] = useState(CLIENT_FORM_INITIAL);
  const [ownerForm, setOwnerForm] = useState(OWNER_FORM_INITIAL);
  const [googleClientForm, setGoogleClientForm] = useState(GOOGLE_CLIENT_FORM_INITIAL);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showGoogleClientModal, setShowGoogleClientModal] = useState(false);
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

  useEffect(() => {
    if (!authLoading && user && role) {
      navigate(role === 'client' ? '/portal' : '/dashboard', { replace: true });
    }
  }, [authLoading, navigate, role, user]);

  const validateClientForm = () => {
    if (!String(clientForm.username || '').trim()) {
      throw new Error('Completa tu nombre de usuario.');
    }
    if (String(clientForm.username || '').trim().length < 3) {
      throw new Error('El nombre de usuario debe tener al menos 3 caracteres.');
    }
    if (!normalizeEmail(clientForm.email)) {
      throw new Error('Completa tu correo.');
    }
    if (clientForm.password.length < 6) {
      throw new Error('La contrasena debe tener al menos 6 caracteres.');
    }
    if (clientForm.password !== clientForm.confirmPassword) {
      throw new Error('Las contrasenas no coinciden.');
    }
    if (!clientForm.phone.trim()) {
      throw new Error('Completa tu telefono.');
    }
    if (!isValidArgentinaPhone(clientForm.phone)) {
      throw new Error('Ingresa un telefono valido de Argentina.');
    }
  };

  const validateGoogleClientForm = () => {
    if (!String(googleClientForm.username || '').trim()) {
      throw new Error('Completa tu nombre de usuario.');
    }
    if (String(googleClientForm.username || '').trim().length < 3) {
      throw new Error('El nombre de usuario debe tener al menos 3 caracteres.');
    }
    if (!normalizeEmail(googleClientForm.email)) {
      throw new Error('No se pudo obtener el correo de Google.');
    }
    if (!googleClientForm.phone.trim()) {
      throw new Error('Completa tu telefono.');
    }
    if (!isValidArgentinaPhone(googleClientForm.phone)) {
      throw new Error('Ingresa un telefono valido de Argentina.');
    }
  };

  const validateOwnerForm = () => {
    const requiredFields = [
      ['fullName', 'Completa el nombre del responsable.'],
      ['contactPhone', 'Completa un telefono valido.'],
      ['documentNumber', 'Completa el documento.'],
      ['complexName', 'Completa el nombre del complejo.'],
      ['complexAddress', 'Completa la direccion.'],
      ['city', 'Completa la ciudad.'],
      ['sportsOffered', 'Indica que deportes ofreces.'],
    ];

    for (const [field, message] of requiredFields) {
      if (!String(ownerForm[field] || '').trim()) {
        throw new Error(message);
      }
    }

    if (!isValidArgentinaPhone(ownerForm.contactPhone)) {
      throw new Error('Ingresa un telefono valido de Argentina.');
    }
    if (Number(ownerForm.courtsCount || 0) < 1) {
      throw new Error('Indica al menos una cancha.');
    }
  };

  const handleClientRegister = async () => {
    if (!termsAccepted) {
      openMessageModal({
        title: 'Debes aceptar los terminos',
        description: 'Acepta los Terminos y Condiciones para continuar.',
      });
      return;
    }

    try {
      validateClientForm();
    } catch (error) {
      openMessageModal({
        title: 'Revisa tus datos',
        description: error.message,
      });
      return;
    }

    setLoading(true);
    setRegisteredSuccess('');

    try {
      localStorage.setItem('auth_intent', 'register');
      localStorage.setItem('register_as', 'client');

      await registerWithEmailPassword({
        email: clientForm.email,
        password: clientForm.password,
        displayName: clientForm.username,
      });

      await fetchAPI('/users/register', {
        method: 'POST',
        body: JSON.stringify({
          registerAs: 'client',
          displayName: clientForm.username,
          phone: clientForm.phone,
        }),
      });

      resetRegisterMarkers();
      sessionStorage.removeItem('role');
      await signOut(auth);

      setRegisteredSuccess('Cuenta creada. Ya podes iniciar sesion.');
      setClientForm(CLIENT_FORM_INITIAL);
      setTermsAccepted(false);
    } catch (error) {
      resetRegisterMarkers();

      try {
        await signOut(auth);
      } catch (_) {
        // noop
      }

      openMessageModal({
        title: 'No se pudo completar el registro',
        description: error.message || 'Intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClientStart = async () => {
    if (!termsAccepted) {
      openMessageModal({
        title: 'Debes aceptar los terminos',
        description: 'Acepta los Terminos y Condiciones para continuar.',
      });
      return;
    }

    setLoading(true);

    try {
      localStorage.setItem('auth_intent', 'register');
      localStorage.setItem('register_as', 'client');

      const firebaseUser = await loginWithGoogle();
      setGoogleClientForm({
        username: firebaseUser?.displayName || '',
        email: normalizeEmail(firebaseUser?.email || ''),
        phone: '',
      });
      setShowGoogleClientModal(true);
    } catch (error) {
      resetRegisterMarkers();

      try {
        await signOut(auth);
      } catch (_) {
        // noop
      }

      if (error.message !== 'popup-closed-by-user') {
        openMessageModal({
          title: 'No se pudo iniciar Google',
          description: error.message || 'Intenta de nuevo.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoogleClient = async () => {
    try {
      validateGoogleClientForm();
    } catch (error) {
      openMessageModal({
        title: 'Revisa tus datos',
        description: error.message,
      });
      return;
    }

    setLoading(true);

    try {
      await fetchAPI('/users/register', {
        method: 'POST',
        body: JSON.stringify({
          registerAs: 'client',
          displayName: googleClientForm.username,
          phone: googleClientForm.phone,
        }),
      });

      resetRegisterMarkers();
      sessionStorage.removeItem('role');
      await signOut(auth);

      setShowGoogleClientModal(false);
      setGoogleClientForm(GOOGLE_CLIENT_FORM_INITIAL);
      setRegisteredSuccess('Cuenta creada con Google. Ya podes iniciar sesion.');
    } catch (error) {
      resetRegisterMarkers();

      try {
        await signOut(auth);
      } catch (_) {
        // noop
      }

      setShowGoogleClientModal(false);
      setGoogleClientForm(GOOGLE_CLIENT_FORM_INITIAL);
      openMessageModal({
        title: 'No se pudo completar el registro',
        description: error.message || 'Intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelGoogleClient = async () => {
    resetRegisterMarkers();

    try {
      await signOut(auth);
    } catch (_) {
      // noop
    }

    setShowGoogleClientModal(false);
    setGoogleClientForm(GOOGLE_CLIENT_FORM_INITIAL);
  };

  const handleOwnerIntent = () => {
    if (!termsAccepted) {
      openMessageModal({
        title: 'Debes aceptar los terminos',
        description: 'Acepta los Terminos y Condiciones para continuar.',
      });
      return;
    }

    try {
      validateOwnerForm();
    } catch (error) {
      openMessageModal({
        title: 'Revisa los datos del complejo',
        description: error.message,
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmedOwner = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    setRegisteredSuccess('');

    try {
      localStorage.setItem('auth_intent', 'register');
      localStorage.setItem('register_as', 'owner');

      await loginWithGoogle();

      await fetchAPI('/users/register', {
        method: 'POST',
        body: JSON.stringify({
          registerAs: 'owner',
          displayName: ownerForm.fullName,
          ownerApplication: ownerForm,
        }),
      });

      resetRegisterMarkers();
      sessionStorage.removeItem('role');
      await signOut(auth);

      setRegisteredSuccess(
        'Solicitud enviada. Revisa tu correo: quedo pendiente de aprobacion.',
      );
      setOwnerForm(OWNER_FORM_INITIAL);
      setTermsAccepted(false);
      setMode('register-client');
    } catch (error) {
      resetRegisterMarkers();

      try {
        await signOut(auth);
      } catch (_) {
        // noop
      }

      if (error.message !== 'popup-closed-by-user') {
        openMessageModal({
          title: 'No se pudo completar el registro',
          description: error.message || 'Intenta de nuevo.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const registerBenefits =
    mode === 'register-client' ? REGISTER_BENEFITS.client : REGISTER_BENEFITS.owner;

  return (
    <div className="theme-shell-dark font-body text-on_surface">
      <header className="app-shell-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link to="/" className="app-shell-logo">
            <BrandLogo imageClassName="h-9 w-auto" />
          </Link>
          <p className="text-sm text-brand_gray">
            Ya tenes cuenta?{' '}
            <button
              type="button"
              onClick={() => navigate('/', { state: { openLogin: true } })}
              className="font-semibold text-primary hover:underline"
            >
              Iniciar sesion
            </button>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-1.5 text-sm text-brand_gray transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>

        {registeredSuccess && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/12 px-5 py-4">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-white">Proceso completado</p>
              <p className="mt-0.5 text-xs text-brand_gray">{registeredSuccess}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <section className="poster-panel-dark poster-grid px-6 py-7 sm:px-8 sm:py-8">
            <p className="poster-chip">Clubes Tucuman</p>
            <div className="mt-6 max-w-[15rem]">
              <BrandLogo imageClassName="h-auto w-full drop-shadow-[0_0_18px_rgb(var(--primary-green-rgb)/0.24)]" />
            </div>
            <h1 className="mt-8 font-['Teko'] text-[clamp(3.6rem,8vw,5.6rem)] uppercase leading-[0.86] tracking-[0.02em] text-white">
              {mode === 'register-client' ? 'Entra a jugar mejor' : 'Suma tu complejo hoy'}
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-brand_white/76">
              {mode === 'register-client'
                ? 'Crea tu cuenta para reservar canchas, comprar productos y moverte por el portal con una experiencia mas clara.'
                : 'Registra tu complejo con una identidad de marca mas fuerte y prepara tu negocio para recibir reservas online.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-primary/20 bg-brand_bg/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand_white/80">
                Reservas online
              </span>
              <span className="rounded-full border border-primary/20 bg-brand_bg/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand_white/80">
                Gestion ordenada
              </span>
              <span className="rounded-full border border-primary/20 bg-brand_bg/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand_white/80">
                Todo en espanol
              </span>
            </div>
            <div className="mt-8 grid gap-3">
              {registerBenefits.map((item) => (
                <RegisterBenefitCard key={item.title} {...item} />
              ))}
            </div>
          </section>

          <div className="app-shell-panel-strong p-6 sm:p-8">
            <h2 className="mb-2 text-3xl font-display font-bold text-white">Crear cuenta</h2>
            <p className="mb-6 text-sm text-brand_gray">
              {mode === 'register-client'
                ? 'Crea tu cuenta para reservar canchas y comprar productos.'
                : 'Registra tu complejo. La autenticacion se hace con Google.'}
            </p>

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          {mode === 'register-client' && (
            <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <FormField
                icon={<UserIcon size={18} />}
                placeholder="Tu nombre de usuario"
                label="Nombre de usuario *"
                autoComplete="nickname"
                value={clientForm.username}
                onChange={(value) =>
                  setClientForm((current) => ({ ...current, username: value }))
                }
              />
              <FormField
                icon={<Mail size={18} />}
                placeholder="correo@ejemplo.com"
                label="Correo *"
                type="email"
                autoComplete="email"
                value={clientForm.email}
                onChange={(value) =>
                  setClientForm((current) => ({ ...current, email: value }))
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  icon={<KeyRound size={18} />}
                  placeholder="Minimo 6 caracteres"
                  label="Contrasena *"
                  type="password"
                  autoComplete="new-password"
                  value={clientForm.password}
                  onChange={(value) =>
                    setClientForm((current) => ({ ...current, password: value }))
                  }
                />
                <FormField
                  icon={<KeyRound size={18} />}
                  placeholder="Repite la contrasena"
                  label="Repetir contrasena *"
                  type="password"
                  autoComplete="new-password"
                  value={clientForm.confirmPassword}
                  onChange={(value) =>
                    setClientForm((current) => ({ ...current, confirmPassword: value }))
                  }
                />
              </div>
              <FormField
                icon={<Phone size={18} />}
                placeholder="+54 381 555-1234"
                label="Telefono *"
                type="tel"
                autoComplete="tel"
                value={clientForm.phone}
                onChange={(value) =>
                  setClientForm((current) => ({ ...current, phone: value }))
                }
              />
            </div>
          )}

          {mode === 'register-owner' && (
            <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  icon={<UserIcon size={18} />}
                  placeholder="Nombre y apellido"
                  label="Responsable *"
                  value={ownerForm.fullName}
                  onChange={(value) =>
                    setOwnerForm((current) => ({ ...current, fullName: value }))
                  }
                />
                <FormField
                  icon={<Phone size={18} />}
                  placeholder="+54 381 555-1234"
                  label="Telefono / WhatsApp *"
                  type="tel"
                  autoComplete="tel"
                  value={ownerForm.contactPhone}
                  onChange={(value) =>
                    setOwnerForm((current) => ({ ...current, contactPhone: value }))
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)]">
                <SelectField
                  label="Documento *"
                  value={ownerForm.documentType}
                  onChange={(value) =>
                    setOwnerForm((current) => ({ ...current, documentType: value }))
                  }
                  options={['DNI', 'CUIT', 'CUIL', 'PASAPORTE']}
                />
                <FormField
                  icon={<FileText size={18} />}
                  placeholder="Numero de documento"
                  label="Numero *"
                  value={ownerForm.documentNumber}
                  onChange={(value) =>
                    setOwnerForm((current) => ({ ...current, documentNumber: value }))
                  }
                />
              </div>

              <FormField
                icon={<Building2 size={18} />}
                placeholder="Club Atletico Ejemplo"
                label="Nombre del complejo *"
                value={ownerForm.complexName}
                onChange={(value) =>
                  setOwnerForm((current) => ({ ...current, complexName: value }))
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  icon={<MapPin size={18} />}
                  placeholder="Direccion del complejo"
                  label="Direccion *"
                  value={ownerForm.complexAddress}
                  onChange={(value) =>
                    setOwnerForm((current) => ({ ...current, complexAddress: value }))
                  }
                />
                <FormField
                  icon={<MapPin size={18} />}
                  placeholder="Tucuman"
                  label="Ciudad *"
                  value={ownerForm.city}
                  onChange={(value) =>
                    setOwnerForm((current) => ({ ...current, city: value }))
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  icon={<LayoutGrid size={18} />}
                  placeholder="Cantidad de canchas"
                  label="Canchas *"
                  type="number"
                  value={ownerForm.courtsCount}
                  onChange={(value) =>
                    setOwnerForm((current) => ({ ...current, courtsCount: value }))
                  }
                />
                <FormField
                  icon={<Users size={18} />}
                  placeholder="Futbol 5, padel, tenis..."
                  label="Deportes *"
                  value={ownerForm.sportsOffered}
                  onChange={(value) =>
                    setOwnerForm((current) => ({ ...current, sportsOffered: value }))
                  }
                />
              </div>

              <FormField
                icon={<Globe size={18} />}
                placeholder="Instagram, web o Google Maps"
                label="Web / Instagram"
                value={ownerForm.websiteOrInstagram}
                onChange={(value) =>
                  setOwnerForm((current) => ({ ...current, websiteOrInstagram: value }))
                }
              />
              <FormField
                icon={<MessageSquare size={18} />}
                placeholder="Contanos algo del complejo, horarios o antiguedad..."
                label="Notas"
                textarea
                value={ownerForm.notes}
                onChange={(value) =>
                  setOwnerForm((current) => ({ ...current, notes: value }))
                }
              />
            </div>
          )}

          <label className="group mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--primary-green)]"
            />
            <span className="text-xs leading-relaxed text-brand_gray">
              Al registrarme acepto los{' '}
              <button
                type="button"
                onClick={() =>
                  openMessageModal({
                    title: 'Terminos y Condiciones',
                    description: 'Terminos y Condiciones: version demo.',
                    tone: 'info',
                  })
                }
                className="text-primary underline underline-offset-2"
              >
                Terminos y Condiciones
              </button>{' '}
              y la{' '}
              <button
                type="button"
                onClick={() =>
                  openMessageModal({
                    title: 'Politica de Privacidad',
                    description: 'Politica de Privacidad: version demo.',
                    tone: 'info',
                  })
                }
                className="text-primary underline underline-offset-2"
              >
                Politica de Privacidad
              </button>
              .
            </span>
          </label>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-brand_gray">
            {mode === 'register-client'
              ? 'Podes crear la cuenta con email o con Google.'
              : 'El alta owner sigue con Google porque requiere validar la identidad.'}
          </div>

          <button
            type="button"
            onClick={mode === 'register-client' ? handleClientRegister : handleOwnerIntent}
            disabled={loading}
            className="app-shell-button-primary mt-4 flex w-full py-3.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-on_primary/70 border-t-transparent" />
            ) : mode === 'register-client' ? (
              <CheckCircle2 size={18} />
            ) : (
              <GoogleIcon />
            )}
            {loading
              ? 'Procesando...'
              : mode === 'register-client'
                ? 'Crear cuenta'
                : 'Continuar con Google'}
          </button>

          {mode === 'register-client' && (
            <>
              <div className="my-4 flex items-center gap-3">
                <div className="flex-1 border-t border-white/10" />
                <span className="text-xs font-semibold uppercase tracking-wider text-brand_gray/70">
                  O registrarte con
                </span>
                <div className="flex-1 border-t border-white/10" />
              </div>
              <button
                type="button"
                onClick={handleGoogleClientStart}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] py-3 text-white transition hover:bg-white/[0.08] disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
                ) : (
                  <GoogleIcon />
                )}
                {loading ? 'Procesando...' : 'Registrarme con Google'}
              </button>
            </>
          )}
        </div>
      </div>
      </main>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand_bg/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgb(var(--bg-main-rgb)/0.98),rgb(var(--bg-main-rgb)/0.92))] p-8 shadow-[0_26px_70px_-32px_rgb(var(--bg-main-rgb)/0.42)]">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-4 top-4 text-brand_gray transition hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Shield size={28} className="text-primary" />
            </div>
            <h3 className="mb-2 text-center text-xl font-display font-bold text-white">
              Confirma tu registro
            </h3>
            <p className="mb-6 text-center text-sm text-brand_gray">
              Vas a crear una cuenta como{' '}
              <span className="font-semibold text-primary">Dueno de Complejo</span>. Se
              abrira Google para autenticarte.
            </p>
            <div className="mb-6 space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs text-brand_gray">
              <p className="flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-primary" />
                Tus datos se guardan de forma segura
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-primary" />
                La solicitud queda pendiente de revision
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-primary" />
                Luego deberas iniciar sesion manualmente
              </p>
            </div>
            <button
              type="button"
              onClick={handleConfirmedOwner}
              className="app-shell-button-primary flex w-full py-3.5 font-bold"
            >
              <GoogleIcon />
              Continuar con Google
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="mt-3 w-full py-2 text-center text-sm text-brand_gray transition hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showGoogleClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand_bg/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgb(var(--bg-main-rgb)/0.98),rgb(var(--bg-main-rgb)/0.92))] p-6 shadow-[0_26px_70px_-32px_rgb(var(--bg-main-rgb)/0.42)] sm:p-8">
            <button
              type="button"
              onClick={handleCancelGoogleClient}
              className="absolute right-4 top-4 text-brand_gray transition hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="mb-2 text-2xl font-display font-bold text-white">Completa tu cuenta</h3>
            <p className="mb-6 text-sm text-brand_gray">
              Google ya valido tu acceso. Necesitamos tu nombre de usuario y un
              telefono valido de Argentina.
            </p>
            <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <FormField
                icon={<UserIcon size={18} />}
                placeholder="Tu nombre de usuario"
                label="Nombre de usuario *"
                autoComplete="nickname"
                value={googleClientForm.username}
                onChange={(value) =>
                  setGoogleClientForm((current) => ({ ...current, username: value }))
                }
              />
              <FormField
                icon={<Mail size={18} />}
                placeholder="correo@ejemplo.com"
                label="Correo de Google"
                type="email"
                value={googleClientForm.email}
                onChange={() => {}}
                disabled
              />
              <FormField
                icon={<Phone size={18} />}
                placeholder="+54 381 555-1234"
                label="Telefono *"
                type="tel"
                autoComplete="tel"
                value={googleClientForm.phone}
                onChange={(value) =>
                  setGoogleClientForm((current) => ({ ...current, phone: value }))
                }
              />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCompleteGoogleClient}
                disabled={loading}
                className="app-shell-button-primary flex flex-1 py-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-on_primary/70 border-t-transparent" />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                {loading ? 'Guardando...' : 'Finalizar registro'}
              </button>
              <button
                type="button"
                onClick={handleCancelGoogleClient}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-brand_gray transition hover:border-primary/25 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <AppModal
        open={Boolean(messageModal)}
        title={messageModal?.title || ''}
        description={messageModal?.description || ''}
        tone={messageModal?.tone || 'error'}
        onClose={closeMessageModal}
      />
    </div>
  );
}
