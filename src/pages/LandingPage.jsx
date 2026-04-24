import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarRange,
  Loader2,
  LogIn,
  MessageCircleMore,
  Search,
  Shield,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import ComplexDiscoverySection from '../components/ComplexDiscoverySection';
import LoginModal from '../components/LoginModal';
import SupportWhatsAppButton from '../components/SupportWhatsAppButton';
import { fetchAPI } from '../services/api';

const CLIENT_STEPS = [
  {
    icon: Search,
    title: 'Busca por complejo',
    description: 'Filtra por nombre, zona y amenities sin caer directo en una cancha suelta.',
  },
  {
    icon: CalendarRange,
    title: 'Filtra por fecha y hora',
    description: 'El ranking prioriza complejos con mas turnos y canchas libres para ese momento.',
  },
  {
    icon: MessageCircleMore,
    title: 'Habla por WhatsApp',
    description: 'Consulta al soporte o al dueno del complejo desde la misma experiencia.',
  },
];

function normalizeSearchValue(value = '') {
  return String(value || '').trim().toLowerCase();
}

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [complexes, setComplexes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (location.state?.openLogin) {
      setLoginOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    fetchAPI('/complexes?clientVisible=true')
      .then((data) => setComplexes(Array.isArray(data) ? data : []))
      .catch(() => setComplexes([]))
      .finally(() => setLoadingData(false));
  }, []);

  const totalCourts = complexes.reduce(
    (sum, complex) => sum + Number(complex?.courtsCount || 0),
    0,
  );
  const totalCities = new Set(
    complexes
      .map((complex) => normalizeSearchValue(complex?.city || complex?.address).split(',')[0])
      .filter(Boolean),
  ).size;

  const heroStats = [
    {
      value: loadingData ? '--' : `+${complexes.length}`,
      label: 'Complejos activos',
    },
    {
      value: loadingData ? '--' : `+${totalCourts}`,
      label: 'Canchas online',
    },
    {
      value: loadingData ? '--' : `+${totalCities}`,
      label: 'Zonas disponibles',
    },
  ];

  const scrollToComplexes = () => {
    document.getElementById('complexes-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand_bg font-body text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--primary-green-rgb)/0.12),transparent_30%),linear-gradient(180deg,rgb(var(--bg-main-rgb))_0%,rgb(var(--bg-main-rgb)/0.94)_52%,rgb(var(--bg-main-rgb))_100%)]" />
        <div className="absolute left-[8%] top-[8%] h-24 w-24 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute right-[10%] top-[5%] h-28 w-28 rounded-full bg-white/25 blur-[54px]" />
        <div className="absolute inset-x-0 bottom-[-8%] h-[40%] bg-[radial-gradient(circle_at_bottom,rgb(var(--primary-green-rgb)/0.24),transparent_52%)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-brand_bg/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow-[0_16px_28px_-22px_rgb(var(--primary-green-rgb)/0.32)]"
          >
            <BrandLogo imageClassName="h-9 w-auto sm:h-10" />
          </Link>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-100 transition hover:border-primary/30 hover:bg-white/10 sm:px-4 sm:text-sm"
            >
              <LogIn size={15} />
              <span className="sm:hidden">Ingresar</span>
              <span className="hidden sm:inline">Iniciar sesion</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-gradient px-3 py-2 text-xs font-semibold text-on_primary shadow-[0_14px_32px_-16px_rgb(var(--primary-green-rgb)/0.72)] transition hover:scale-[1.02] hover:brightness-110 sm:px-4 sm:text-sm"
            >
              <UserPlus size={15} />
              <span>Registrarse</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pb-24">
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
          <div className="poster-panel-dark poster-grid px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/65 to-transparent" />
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.92fr)] lg:items-center">
              <div className="relative">
                <p className="poster-chip">
                  <Sparkles size={14} />
                  Reserva online para jugadores
                </p>

                <h1 className="mt-8 max-w-[8ch] font-['Teko'] text-[clamp(4.2rem,12vw,7rem)] uppercase leading-[0.84] tracking-[0.02em] text-white [text-shadow:0_12px_34px_rgb(var(--bg-main-rgb)/0.48)]">
                  Reserva
                  <span className="block text-primary [text-shadow:0_0_24px_rgb(var(--primary-green-rgb)/0.42)]">
                    canchas
                  </span>
                  en minutos
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Explora complejos completos, filtra por amenities, fecha y horario, y
                  descubre donde tienes mas opciones reales para jugar.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={scrollToComplexes}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-6 py-3.5 font-semibold text-on_primary shadow-[0_18px_44px_-18px_rgb(var(--primary-green-rgb)/0.76)] transition hover:scale-[1.02] hover:brightness-110"
                  >
                    Buscar complejos
                    <ArrowRight size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-6 py-3.5 font-medium text-white transition hover:border-primary/32 hover:bg-white/10"
                  >
                    <UserPlus size={18} />
                    Registrarse
                  </button>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {heroStats.map((item) => (
                    <ClientStatCard key={item.label} {...item} />
                  ))}
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {CLIENT_STEPS.map((item) => (
                    <ClientStepCard key={item.title} {...item} />
                  ))}
                </div>
              </div>

              <div className="neon-card light-scan p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => navigate('/register?tipo=owner')}
                  className="mb-5 flex w-full items-center gap-4 rounded-2xl border border-primary/40 bg-[linear-gradient(135deg,rgba(115,209,29,0.12),rgba(115,209,29,0.04))] px-5 py-5 text-left shadow-[0_8px_28px_-12px_rgba(115,209,29,0.28)] transition hover:border-primary/60 hover:bg-[linear-gradient(135deg,rgba(115,209,29,0.18),rgba(115,209,29,0.08))] hover:shadow-[0_12px_36px_-12px_rgba(115,209,29,0.4)]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Building2 size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-white">Eres dueno de un complejo?</p>
                    <p className="mt-0.5 text-sm text-slate-300">
                      Publica amenities, horarios y recibe reservas online.
                    </p>
                  </div>
                </button>

                <p className="poster-chip">Nuevo buscador</p>
                <h2 className="mt-4 font-['Barlow_Condensed'] text-4xl uppercase text-white">
                  Compara complejos completos
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  La nueva grilla prioriza complejos con mayor disponibilidad real y te deja
                  escribir directo al dueno por WhatsApp.
                </p>

                <div className="mt-5 space-y-3">
                  <FeatureLine icon={Search} text="Busqueda por nombre, zona y amenities." />
                  <FeatureLine icon={CalendarRange} text="Filtro por fecha y horario con ranking por turnos libres." />
                  <FeatureLine icon={Shield} text="Reservas desde una vista mas clara y enfocada en el complejo." />
                </div>

                <button
                  type="button"
                  onClick={scrollToComplexes}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:border-primary/32 hover:bg-white/10"
                >
                  Abrir buscador avanzado
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
          <ComplexDiscoverySection
            sectionId="complexes-section"
            eyebrow="Explora y reserva"
            title="Encuentra el complejo con mas opciones para tu horario"
            description="Filtra por amenities, fecha y horario. El buscador ordena los complejos por cantidad de turnos y canchas disponibles, y cada tarjeta te deja abrir el detalle o escribirle al dueno por WhatsApp."
            onNeedAuth={() => setLoginOpen(true)}
          />
        </section>

        <footer className="mx-auto max-w-7xl px-4 pt-8 text-center text-sm uppercase tracking-[0.32em] text-primary/70 sm:px-6">
          {loadingData ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Cargando plataforma
            </span>
          ) : (
            'Mas reservas - Mas juego - Mejor experiencia'
          )}
        </footer>
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <SupportWhatsAppButton message="Hola, quiero hacer una consulta sobre Clubes Tucuman." />
    </div>
  );
}

function ClientStatCard({ value, label }) {
  return (
    <div className="neon-card px-4 py-4">
      <p className="font-['Teko'] text-5xl uppercase leading-none text-white">{value}</p>
      <p className="mt-2 font-['Barlow_Condensed'] text-lg uppercase tracking-[0.08em] text-primary/85">
        {label}
      </p>
    </div>
  );
}

function ClientStepCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-[1.45rem] border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 font-['Barlow_Condensed'] text-2xl uppercase text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}

function FeatureLine({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Icon size={17} />
      </div>
      <p className="text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}
