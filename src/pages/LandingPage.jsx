import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarRange,
  ChevronRight,
  Loader2,
  LogIn,
  MapPin,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';
import LoginModal from '../components/LoginModal';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../contexts/AuthContext';
import { fetchAPI } from '../services/api';

const CLIENT_STEPS = [
  {
    icon: Search,
    title: 'Busca complejo',
    description: 'Filtra por nombre o zona y encuentra canchas activas mas rapido.',
  },
  {
    icon: CalendarRange,
    title: 'Elige horario',
    description: 'Revisa disponibilidad y entra a reservar desde una experiencia clara.',
  },
  {
    icon: Shield,
    title: 'Reserva sin vueltas',
    description: 'Inicia sesion y confirma tus turnos desde la misma plataforma.',
  },
];

function normalizeSearchValue(value = '') {
  return String(value || '').trim().toLowerCase();
}

function buildLocationLabel(complex) {
  return complex?.address || complex?.city || 'Tucuman';
}

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [complexes, setComplexes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
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

  const normalizedSearch = normalizeSearchValue(search);
  const filteredComplexes = complexes.filter((complex) => {
    if (!normalizedSearch) {
      return true;
    }

    return [complex?.name, complex?.address, complex?.city]
      .map(normalizeSearchValue)
      .join(' ')
      .includes(normalizedSearch);
  });

  const featuredComplexes = filteredComplexes.slice(0, 3);
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(115,209,29,0.12),transparent_30%),linear-gradient(180deg,rgba(0,16,44,1)_0%,rgba(0,16,44,0.94)_52%,rgba(0,16,44,1)_100%)]" />
        <div className="absolute left-[8%] top-[8%] h-24 w-24 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute right-[10%] top-[5%] h-28 w-28 rounded-full bg-white/25 blur-[54px]" />
        <div className="absolute inset-x-0 bottom-[-8%] h-[40%] bg-[radial-gradient(circle_at_bottom,rgba(115,209,29,0.24),transparent_52%)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-brand_bg/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow-[0_16px_28px_-22px_rgba(115,209,29,0.32)]"
          >
            <BrandLogo imageClassName="h-9 w-auto sm:h-10" />
          </Link>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-100 transition hover:border-primary/30 hover:bg-white/10 sm:px-4 sm:text-sm"
            >
              <LogIn size={15} />
              <span className="hidden sm:inline">Iniciar sesion</span>
            </button>
            <Link
              to="/duenos"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-gradient px-3 py-2 text-xs font-semibold text-on_primary shadow-[0_14px_32px_-16px_rgba(115,209,29,0.72)] transition hover:scale-[1.02] hover:brightness-110 sm:px-4 sm:text-sm"
            >
              <span className="sm:hidden">Para duenos</span>
              <span className="hidden sm:inline">Si sos dueno entra aca</span>
              <ArrowRight size={15} />
            </Link>
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

                <h1 className="mt-8 max-w-[8ch] font-['Teko'] text-[clamp(4.2rem,12vw,7rem)] uppercase leading-[0.84] tracking-[0.02em] text-white [text-shadow:0_12px_34px_rgba(0,16,44,0.48)]">
                  Reserva
                  <span className="block text-primary [text-shadow:0_0_24px_rgba(115,209,29,0.42)]">
                    canchas
                  </span>
                  en minutos
                </h1>

                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Encuentra complejos, filtra por zona y entra a reservar desde una portada mucho
                  mas clara. Si tienes un complejo, ahora tienes una pagina aparte pensada para tu
                  negocio.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={scrollToComplexes}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-6 py-3.5 font-semibold text-on_primary shadow-[0_18px_44px_-18px_rgba(115,209,29,0.76)] transition hover:scale-[1.02] hover:brightness-110"
                  >
                    Ver complejos
                    <ArrowRight size={18} />
                  </button>
                  <Link
                    to="/duenos"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-6 py-3.5 font-medium text-white transition hover:border-primary/32 hover:bg-white/10"
                  >
                    Si sos dueno entra aca
                    <ChevronRight size={18} />
                  </Link>
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
                <p className="poster-chip">Explora rapido</p>
                <h2 className="mt-4 font-['Barlow_Condensed'] text-4xl uppercase text-white">
                  Busca tu proxima cancha
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Empieza escribiendo una zona o el nombre de un complejo y baja directo a la
                  grilla de resultados.
                </p>

                <div className="relative mt-5">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                    size={18}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Ej.: Yerba Buena, Tucuman Lawn Tennis..."
                    className="neon-input pl-11"
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {loadingData ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="animate-spin text-primary" size={34} />
                    </div>
                  ) : featuredComplexes.length === 0 ? (
                    <div className="rounded-[1.45rem] border border-white/8 bg-white/[0.03] px-4 py-6 text-center">
                      <p className="font-['Barlow_Condensed'] text-2xl uppercase text-white">
                        No hay resultados
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Prueba con otro nombre o baja a la seccion de complejos.
                      </p>
                    </div>
                  ) : (
                    featuredComplexes.map((complex) => (
                      <button
                        key={complex._id}
                        type="button"
                        onClick={scrollToComplexes}
                        className="flex w-full items-center justify-between gap-4 rounded-[1.45rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-left transition hover:border-primary/24 hover:bg-white/[0.05]"
                      >
                        <div>
                          <p className="font-['Barlow_Condensed'] text-2xl uppercase text-white">
                            {complex.name}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                            <MapPin size={14} className="text-primary" />
                            <span className="truncate">{buildLocationLabel(complex)}</span>
                          </p>
                        </div>
                        <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                          Ver
                        </span>
                      </button>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={scrollToComplexes}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary transition hover:gap-3"
                >
                  Explorar todos los complejos
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="complexes-section"
          className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10"
        >
          <div className="poster-panel-dark px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="poster-chip">Reserva online</p>
                <h2 className="mt-4 font-['Teko'] text-[clamp(3.5rem,10vw,6rem)] uppercase leading-[0.86] tracking-[0.02em] text-white">
                  Complejos destacados
                </h2>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Busca un complejo, mira disponibilidad y entra a reservar desde una experiencia
                  mucho mas visual.
                </p>
              </div>

              <div className="w-full lg:max-w-md">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-primary">
                  Buscar complejo o zona
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                    size={18}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Ej.: Yerba Buena, Tucuman Lawn Tennis..."
                    className="neon-input pl-11"
                  />
                </div>
              </div>
            </div>

            {loadingData ? (
              <div className="flex justify-center py-24">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : filteredComplexes.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-['Barlow_Condensed'] text-4xl uppercase text-white">
                  No se encontraron complejos
                </p>
                <p className="mt-3 text-slate-300">
                  Prueba con otro nombre, barrio o ciudad para seguir buscando.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredComplexes.map((complex) => (
                  <ComplexCard
                    key={complex._id}
                    complex={complex}
                    onNeedAuth={() => setLoginOpen(true)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="mx-auto max-w-7xl px-4 pt-8 text-center text-sm uppercase tracking-[0.32em] text-primary/70 sm:px-6">
          Mas reservas - Mas juego - Mejor experiencia
        </footer>
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
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

function ComplexCard({ complex, onNeedAuth }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = () => {
    if (!user) {
      onNeedAuth();
      return;
    }

    navigate(`/portal/complejo/${complex._id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group neon-card overflow-hidden text-left transition duration-300 hover:-translate-y-1 hover:border-primary/28"
    >
      <div className="relative h-56 overflow-hidden">
        {complex.imageUrl ? (
          <img
            src={complex.imageUrl}
            alt={complex.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(115,209,29,0.22),transparent_28%),linear-gradient(180deg,rgba(0,16,44,0.86)_0%,rgba(0,16,44,1)_100%)]">
            <span className="font-['Teko'] text-7xl uppercase tracking-[0.08em] text-primary/90">
              Futbol
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_18%,rgba(0,16,44,0.12)_45%,rgba(0,16,44,0.8)_100%)]" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-brand_bg/78 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {complex.courtsCount ?? '-'} canchas
          </span>
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-brand_bg/78 px-2.5 py-1 text-sm text-brand_white/80">
            <span>4.8</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-['Barlow_Condensed'] text-3xl uppercase leading-none text-white">
          {complex.name}
        </h3>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
          <MapPin size={15} className="text-primary" />
          <span className="truncate">{buildLocationLabel(complex)}</span>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-300">
            {user ? 'Entrar a ver horarios' : 'Inicia sesion para reservar'}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Ver mas
            <ChevronRight size={15} />
          </span>
        </div>
      </div>
    </button>
  );
}
