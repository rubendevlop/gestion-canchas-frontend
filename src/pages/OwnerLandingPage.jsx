import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarRange,
  Clock3,
  LayoutDashboard,
  LogIn,
  Shield,
  ShoppingCart,
  Smartphone,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import LoginModal from '../components/LoginModal';
import BrandLogo from '../components/BrandLogo';
import { fetchAPI } from '../services/api';

const BENEFIT_ITEMS = [
  {
    icon: CalendarRange,
    title: 'Recibi reservas online',
    description: 'Mostra horarios, precios y disponibilidad sin depender del telefono.',
  },
  {
    icon: LayoutDashboard,
    title: 'Gestiona todo desde un panel',
    description: 'Visualiza turnos, ocupacion y movimientos con una interfaz simple.',
  },
  {
    icon: ShoppingCart,
    title: 'Vende productos y extras',
    description: 'Suma tienda, eventos o consumos desde la misma plataforma.',
  },
  {
    icon: Users,
    title: 'Llega a mas jugadores',
    description: 'Aparece en la vidriera publica y capta nuevas reservas todos los dias.',
  },
];

const PLATFORM_CHIPS = [
  'Reservas online',
  'Cobros claros',
  'Tienda y eventos',
  'Vista publica para clientes',
];

const WEEK_DAYS = [
  { label: 'MIE', day: '22' },
  { label: 'JUE', day: '23' },
  { label: 'VIE', day: '24', active: true },
  { label: 'SAB', day: '25' },
];

const DEMO_SLOTS = [
  { title: 'Cancha 1', surface: 'Cesped sintetico', time: '20:00', price: '$15.000' },
  { title: 'Cancha 2', surface: 'Cesped sintetico', time: '21:00', price: '$15.000' },
  { title: 'Cancha 3', surface: 'Cesped sintetico', time: '22:00', price: '$15.000' },
];

function normalizeSearchValue(value = '') {
  return String(value || '').trim().toLowerCase();
}

export default function OwnerLandingPage() {
  const navigate = useNavigate();
  const [complexes, setComplexes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

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
      label: 'Complejos visibles',
      note: 'Publicados en la vidriera para clientes',
    },
    {
      value: loadingData ? '--' : `+${totalCourts}`,
      label: 'Canchas activas',
      note: 'Con horarios y disponibilidad online',
    },
    {
      value: loadingData ? '--' : `+${totalCities}`,
      label: 'Zonas cubiertas',
      note: 'Demanda repartida en multiples barrios',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand_bg font-body text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--primary-green-rgb)/0.12),transparent_32%),linear-gradient(180deg,rgb(var(--bg-main-rgb))_0%,rgb(var(--bg-main-rgb)/0.94)_52%,rgb(var(--bg-main-rgb))_100%)]" />
        <div className="absolute left-[8%] top-[8%] h-24 w-24 rounded-full bg-white/25 blur-2xl" />
        <div className="absolute right-[10%] top-[5%] h-28 w-28 rounded-full bg-white/30 blur-[54px]" />
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
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-100 transition hover:border-primary/30 hover:bg-white/10 sm:px-4 sm:text-sm"
            >
              <ArrowLeft size={15} />
              <span className="sm:hidden">Volver</span>
              <span className="hidden sm:inline">Volver al inicio</span>
            </Link>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-100 transition hover:border-primary/30 hover:bg-white/10 sm:px-4 sm:text-sm"
            >
              <LogIn size={15} />
              <span className="hidden sm:inline">Iniciar sesion</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/register?tipo=owner')}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-gradient px-3 py-2 text-xs font-semibold text-on_primary shadow-[0_14px_32px_-16px_rgb(var(--primary-green-rgb)/0.72)] transition hover:scale-[1.02] hover:brightness-110 sm:px-4 sm:text-sm"
            >
              <UserPlus size={15} />
              <span className="sm:hidden">Alta owner</span>
              <span className="hidden sm:inline">Sumar mi cancha</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pb-24">
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
          <div className="poster-panel-dark poster-grid px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/65 to-transparent" />
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.94fr)] lg:items-center">
              <div className="relative">
                <p className="poster-chip">
                  <Sparkles size={14} />
                  La plataforma #1 para duenos de canchas
                </p>

                <h1 className="mt-6 max-w-[7ch] font-['Teko'] text-[clamp(5rem,15vw,8.8rem)] uppercase leading-[0.82] tracking-[0.02em] text-white [text-shadow:0_12px_34px_rgb(var(--bg-main-rgb)/0.48)]">
                  Tenes
                  <span className="block text-primary [text-shadow:0_0_24px_rgb(var(--primary-green-rgb)/0.42)]">
                    canchas?
                  </span>
                </h1>

                <p className="mt-4 max-w-xl font-['Barlow_Condensed'] text-[clamp(2rem,4vw,3.1rem)] uppercase leading-[0.92] tracking-[0.01em] text-white">
                  Hace crecer tu negocio con{' '}
                  <span className="text-primary">Clubes Tucuman</span>
                </p>

                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Recibi reservas online, organiza tus horarios, vende productos y mantene una
                  vidriera publica para que mas jugadores te encuentren rapido.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('/register?tipo=owner')}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-6 py-3.5 font-semibold text-on_primary shadow-[0_18px_44px_-18px_rgb(var(--primary-green-rgb)/0.76)] transition hover:scale-[1.02] hover:brightness-110"
                  >
                    Suma tu cancha hoy
                    <ArrowRight size={18} />
                  </button>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-6 py-3.5 font-medium text-white transition hover:border-primary/32 hover:bg-white/10"
                  >
                    Ver portada de clientes
                    <ArrowLeft size={18} />
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {PLATFORM_CHIPS.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-primary/20 bg-brand_bg/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-brand_white/80"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {heroStats.map((item) => (
                    <StatCard key={item.label} {...item} />
                  ))}
                </div>

                <div className="neon-card light-scan mt-8 p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-2 text-primary">
                    <Shield size={16} />
                    <p className="font-['Barlow_Condensed'] text-base uppercase tracking-[0.2em]">
                      Todo en un solo lugar
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {BENEFIT_ITEMS.map((item) => (
                      <BenefitCard key={item.title} {...item} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative min-h-[32rem] sm:min-h-[36rem] lg:min-h-[42rem]">
                <div className="absolute inset-x-[10%] bottom-[8%] h-20 rounded-full bg-primary/35 blur-3xl" />
                <div className="absolute left-0 right-[18%] top-[16%] sm:right-[24%] lg:top-[24%]">
                  <DashboardMockup complexesCount={complexes.length} totalCourts={totalCourts} />
                </div>
                <div className="float-slow absolute right-[4%] top-[2%] w-[16.5rem] rotate-[8deg] sm:w-[18rem] lg:w-[21rem]">
                  <PhoneMockup />
                </div>
                <div className="float-slow-delay absolute bottom-0 left-[2%] right-[2%]">
                  <OwnerBanner onClick={() => navigate('/register?tipo=owner')} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
          <div className="neon-card flex flex-col items-start justify-between gap-5 px-6 py-6 sm:flex-row sm:items-center sm:px-8">
            <div>
              <p className="poster-chip">Alta owner</p>
              <h2 className="mt-4 font-['Teko'] text-[clamp(3rem,8vw,4.8rem)] uppercase leading-[0.86] text-white">
                Publica tu complejo
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-300">
                Si ya decidiste avanzar, entra al registro owner y deja tu complejo listo para
                empezar a recibir reservas.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/register?tipo=owner')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-6 py-3.5 font-semibold text-on_primary shadow-[0_18px_44px_-18px_rgb(var(--primary-green-rgb)/0.76)] transition hover:scale-[1.02] hover:brightness-110"
              >
                Crear alta owner
                <ArrowRight size={18} />
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-6 py-3.5 font-medium text-white transition hover:border-primary/32 hover:bg-white/10"
              >
                Volver a clientes
              </Link>
            </div>
          </div>
        </section>

        <footer className="mx-auto max-w-7xl px-4 pt-8 text-center text-sm uppercase tracking-[0.32em] text-primary/70 sm:px-6">
          Mas reservas - Mas ventas - Mejor gestion
        </footer>
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

function StatCard({ value, label, note }) {
  return (
    <div className="neon-card px-4 py-4">
      <p className="font-['Teko'] text-5xl uppercase leading-none text-white">{value}</p>
      <p className="mt-2 font-['Barlow_Condensed'] text-lg uppercase tracking-[0.08em] text-primary/85">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{note}</p>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, description }) {
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

function PhoneMockup() {
  return (
    <div className="relative overflow-hidden rounded-[2.8rem] border border-white/18 bg-brand_bg p-3 shadow-[0_36px_90px_-40px_rgb(var(--primary-green-rgb)/0.5)]">
      <div className="absolute inset-x-10 top-2 h-6 rounded-b-[1rem] bg-black/80" />
      <div className="rounded-[2.2rem] border border-white/8 bg-[linear-gradient(180deg,rgb(var(--bg-main-rgb)/0.88)_0%,rgb(var(--bg-main-rgb))_100%)] px-4 pb-5 pt-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Clubes Tucuman</p>
            <h3 className="mt-2 font-['Barlow_Condensed'] text-3xl uppercase text-white">
              Nueva reserva
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/16 text-primary">
            <Smartphone size={18} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-white/[0.04] p-1.5">
          <button className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-on_primary">
            Canchas
          </button>
          <button className="rounded-xl px-3 py-2 text-sm font-medium text-slate-400">
            Eventos
          </button>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {WEEK_DAYS.map((item) => (
            <div
              key={`${item.label}-${item.day}`}
              className={`rounded-2xl border px-3 py-3 text-center ${
                item.active
                  ? 'border-primary/35 bg-primary/15 text-white'
                  : 'border-white/8 bg-white/[0.03] text-slate-400'
              }`}
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em]">
                {item.label}
              </p>
              <p className="mt-1 font-['Barlow_Condensed'] text-2xl uppercase">{item.day}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {DEMO_SLOTS.map((slot) => (
            <div
              key={`${slot.title}-${slot.time}`}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-['Barlow_Condensed'] text-2xl uppercase text-white">
                    {slot.title}
                  </p>
                  <p className="text-sm text-slate-400">{slot.surface}</p>
                </div>
                <div className="text-right">
                  <p className="font-['Barlow_Condensed'] text-2xl uppercase text-white">
                    {slot.time}
                  </p>
                  <p className="text-sm font-semibold text-primary">{slot.price}</p>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] text-on_primary"
              >
                Reservar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardMockup({ complexesCount, totalCourts }) {
  return (
    <div className="neon-card light-scan px-5 py-5 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Resumen general</p>
          <h3 className="mt-2 font-['Barlow_Condensed'] text-3xl uppercase text-white">
            Panel owner
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/14 text-primary">
          <LayoutDashboard size={20} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <DashboardMetric
          icon={CalendarRange}
          value={complexesCount || 12}
          label="Reservas del mes"
          accent="+23%"
        />
        <DashboardMetric
          icon={BarChart3}
          value={totalCourts || 24}
          label="Canchas online"
          accent="+18%"
        />
        <DashboardMetric icon={Users} value={534} label="Jugadores" accent="+31%" />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.45rem] border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Reservas por dia</span>
            <Clock3 size={16} />
          </div>
          <div className="mt-5 flex h-36 items-end gap-2">
            {[28, 46, 34, 72, 41, 84, 96].map((height, index) => (
              <div key={height} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-full bg-[linear-gradient(180deg,var(--primary-green-hover)_0%,var(--primary-green)_100%)]"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
                  {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.45rem] border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Canchas mas vistas</span>
            <Shield size={16} />
          </div>
          <div className="mt-5 flex items-center gap-4">
            <div className="relative h-28 w-28 rounded-full bg-[conic-gradient(var(--primary-green)_0_42%,var(--primary-green-hover)_42%_74%,rgb(var(--text-white-rgb)/0.24)_74%_100%)]">
              <div className="absolute inset-[22%] rounded-full bg-brand_bg" />
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <LegendItem color="bg-primary" label="Cancha 1" value="42%" />
              <LegendItem color="bg-brand_green_hover" label="Cancha 2" value="32%" />
              <LegendItem color="bg-white/30" label="Cancha 3" value="26%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardMetric({ icon: Icon, value, label, accent }) {
  return (
    <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <Icon size={18} />
        </div>
        <span className="text-sm font-semibold text-primary">{accent}</span>
      </div>
      <p className="mt-4 font-['Teko'] text-5xl uppercase leading-none text-white">{value}</p>
      <p className="mt-2 text-sm uppercase tracking-[0.12em] text-slate-400">{label}</p>
    </div>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="min-w-[4.5rem]">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function OwnerBanner({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-4 rounded-[1.9rem] border border-primary/30 bg-primary-gradient px-5 py-4 text-left shadow-[0_24px_70px_-34px_rgb(var(--primary-green-rgb)/0.78)] transition hover:brightness-105"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brand_white/45 bg-brand_white/15 shadow-[0_0_0_10px_rgb(var(--text-white-rgb)/0.12)]">
          <BrandLogo imageClassName="h-8 w-auto" />
        </div>
        <div>
          <p className="font-['Teko'] text-5xl uppercase leading-[0.9] tracking-[0.02em] text-on_primary sm:text-6xl">
            Suma tu cancha hoy
          </p>
          <p className="mt-1 font-medium text-on_primary/72">
            Empieza a cobrar mejor y a ordenar tus reservas.
          </p>
        </div>
      </div>
      <div className="hidden h-14 w-14 items-center justify-center rounded-full bg-brand_bg text-brand_white transition group-hover:translate-x-1 md:flex">
        <ArrowRight size={24} />
      </div>
    </button>
  );
}
