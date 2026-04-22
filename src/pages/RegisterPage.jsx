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
          className={`pointer-events-none absolute left-0 text-outline_variant ${
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
            className={`w-full rounded-xl border border-outline_variant/30 bg-white py-3 pl-12 pr-4 text-on_surface placeholder-outline_variant transition focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 ${
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
            className={`w-full rounded-xl border border-outline_variant/30 bg-white py-3 pl-12 pr-4 text-on_surface placeholder-outline_variant transition focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 ${
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
        className="w-full rounded-xl border border-outline_variant/30 bg-white px-4 py-3 text-on_surface transition focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(115,209,29,0.14),transparent_32%),linear-gradient(180deg,var(--text-white),rgb(var(--background-rgb)))] font-body text-on_surface">
      <header className="sticky top-0 z-20 border-b border-outline_variant/20 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link to="/">
            <BrandLogo imageClassName="h-9 w-auto" />
          </Link>
          <p className="text-sm text-on_surface_variant">
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

      <main className="mx-auto max-w-xl px-5 py-10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-1.5 text-sm text-on_surface_variant transition hover:text-on_surface"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>

        {registeredSuccess && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-700" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Proceso completado</p>
              <p className="mt-0.5 text-xs text-emerald-700">{registeredSuccess}</p>
            </div>
          </div>
        )}

        <div className="rounded-[2rem] border border-outline_variant/20 bg-white p-6 shadow-[0_28px_60px_-36px_rgba(24,36,24,0.22)] sm:p-8">
          <h1 className="mb-2 text-3xl font-display font-bold">Crear cuenta</h1>
          <p className="mb-6 text-sm text-on_surface_variant">
            {mode === 'register-client'
              ? 'Crea tu cuenta para reservar canchas y comprar productos.'
              : 'Registra tu complejo. La autenticacion se hace con Google.'}
          </p>

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

          {mode === 'register-client' && (
            <div className="space-y-4 rounded-[1.75rem] border border-outline_variant/15 bg-surface_container_low p-4 sm:p-5">
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
            <div className="space-y-4 rounded-[1.75rem] border border-outline_variant/15 bg-surface_container_low p-4 sm:p-5">
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
              className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span className="text-xs leading-relaxed text-on_surface_variant">
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

          <div className="mt-3 rounded-2xl border border-outline_variant/15 bg-surface_container_low px-4 py-3 text-sm text-on_surface_variant">
            {mode === 'register-client'
              ? 'Podes crear la cuenta con email o con Google.'
              : 'El alta owner sigue con Google porque requiere validar la identidad.'}
          </div>

          <button
            type="button"
            onClick={mode === 'register-client' ? handleClientRegister : handleOwnerIntent}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary_container to-primary py-3.5 font-semibold text-on_primary shadow-[0_10px_28px_-12px_rgba(47,158,68,0.34)] transition hover:brightness-110 disabled:opacity-50"
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
                <div className="flex-1 border-t border-outline_variant/20" />
                <span className="text-xs font-semibold uppercase tracking-wider text-outline">
                  O registrarte con
                </span>
                <div className="flex-1 border-t border-outline_variant/20" />
              </div>
              <button
                type="button"
                onClick={handleGoogleClientStart}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-outline_variant/30 bg-white py-3 text-on_surface transition hover:bg-surface_container_low disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-outline_variant border-t-transparent" />
                ) : (
                  <GoogleIcon />
                )}
                {loading ? 'Procesando...' : 'Registrarme con Google'}
              </button>
            </>
          )}
        </div>
      </main>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-outline_variant/25 bg-white p-8 shadow-[0_26px_70px_-32px_rgba(24,36,24,0.28)]">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-4 top-4 text-outline transition hover:text-on_surface"
            >
              <X size={20} />
            </button>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Shield size={28} className="text-primary" />
            </div>
            <h3 className="mb-2 text-center text-xl font-display font-bold">
              Confirma tu registro
            </h3>
            <p className="mb-6 text-center text-sm text-on_surface_variant">
              Vas a crear una cuenta como{' '}
              <span className="font-semibold text-primary">Dueno de Complejo</span>. Se
              abrira Google para autenticarte.
            </p>
            <div className="mb-6 space-y-2 rounded-2xl bg-surface_container p-4 text-xs text-on_surface_variant">
              <p className="flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                Tus datos se guardan de forma segura
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                La solicitud queda pendiente de revision
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                Luego deberas iniciar sesion manualmente
              </p>
            </div>
            <button
              type="button"
              onClick={handleConfirmedOwner}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary_container to-primary py-3.5 font-bold text-on_primary transition hover:brightness-110"
            >
              <GoogleIcon />
              Continuar con Google
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="mt-3 w-full py-2 text-center text-sm text-outline transition hover:text-on_surface"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showGoogleClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-outline_variant/25 bg-white p-6 shadow-[0_26px_70px_-32px_rgba(24,36,24,0.28)] sm:p-8">
            <button
              type="button"
              onClick={handleCancelGoogleClient}
              className="absolute right-4 top-4 text-outline transition hover:text-on_surface"
            >
              <X size={20} />
            </button>
            <h3 className="mb-2 text-2xl font-display font-bold">Completa tu cuenta</h3>
            <p className="mb-6 text-sm text-on_surface_variant">
              Google ya valido tu acceso. Necesitamos tu nombre de usuario y un
              telefono valido de Argentina.
            </p>
            <div className="space-y-4 rounded-[1.75rem] border border-outline_variant/15 bg-surface_container_low p-4 sm:p-5">
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
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary_container to-primary py-3 font-semibold text-on_primary transition hover:brightness-110 disabled:opacity-50"
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
                className="rounded-2xl border border-outline_variant/20 px-4 py-3 text-sm font-medium text-on_surface_variant transition hover:border-outline hover:text-on_surface"
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
