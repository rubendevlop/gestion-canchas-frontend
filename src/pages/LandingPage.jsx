import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Loader2,
  LogIn,
  MapPin,
  Search,
  Star,
  UserPlus,
} from 'lucide-react';
import LoginModal from '../components/LoginModal';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../contexts/AuthContext';
import { fetchAPI } from '../services/api';

function normalizeSearchValue(value = '') {
  return String(value || '').trim().toLowerCase();
}

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, loading: authLoading } = useAuth();

  const [complexes, setComplexes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && user && role) {
      navigate(role === 'client' ? '/portal' : '/dashboard', { replace: true });
    }
  }, [authLoading, navigate, role, user]);

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

    const haystack = [
      complex?.name,
      complex?.address,
      complex?.city,
    ]
      .map(normalizeSearchValue)
      .join(' ');

    return haystack.includes(normalizedSearch);
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-body text-on_surface">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top,rgba(123,207,82,0.1),transparent_48%)]" />
        <div className="absolute left-[-6rem] top-[6rem] h-[18rem] w-[18rem] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-outline_variant/25 bg-white/84 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="shrink-0 rounded-2xl border border-outline_variant/15 bg-white/85 px-3 py-2 shadow-[0_12px_24px_-20px_rgba(20,32,22,0.24)]"
            >
              <BrandLogo imageClassName="h-9 w-auto sm:h-10" />
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-login"
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-2 rounded-2xl border border-outline_variant/25 bg-white px-4 py-2 text-sm font-semibold text-on_surface transition hover:border-primary/30 hover:text-primary"
              >
                <LogIn size={15} />
                <span>Iniciar sesion</span>
              </button>
              <button
                type="button"
                id="btn-register"
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary_container to-primary px-4 py-2 text-sm font-semibold text-on_primary shadow-[0_8px_22px_-10px_rgba(47,158,68,0.4)] transition hover:brightness-110"
              >
                <UserPlus size={15} />
                <span>Registrarse</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-outline_variant/20 bg-[linear-gradient(145deg,#ffffff,#eff7e5)] px-6 py-16 text-center shadow-[0_26px_70px_-42px_rgba(24,36,24,0.22)] sm:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(123,207,82,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(242,177,52,0.12),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[repeating-linear-gradient(90deg,transparent_0,transparent_94px,rgba(123,207,82,0.08)_94px,rgba(123,207,82,0.08)_188px)] opacity-35" />

          <div className="relative mx-auto max-w-3xl">
            <h1 className="mb-4 text-5xl font-display font-bold leading-tight text-on_surface">
              Reserva tu cancha
              <br />
              <span className="text-primary">en minutos.</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-lg text-on_surface_variant">
              Encontra un complejo, elegi tu horario y entra a jugar.
            </p>

            <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary_container to-primary px-7 py-3.5 font-bold text-on_primary shadow-[0_10px_28px_-10px_rgba(47,158,68,0.4)] transition hover:brightness-110"
              >
                <UserPlus size={18} />
                Crear cuenta gratis
              </button>
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-2 rounded-2xl border border-outline_variant/30 bg-white px-7 py-3.5 font-semibold text-on_surface transition hover:border-primary/30 hover:text-primary"
              >
                <LogIn size={18} />
                Ya tengo cuenta
              </button>
            </div>

            <div className="relative mx-auto max-w-lg">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-outline"
                size={18}
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar complejo o ciudad..."
                className="w-full rounded-2xl border border-outline_variant/25 bg-white py-4 pl-14 pr-6 text-base text-on_surface placeholder-outline transition-all focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {loadingData ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={36} />
          </div>
        ) : filteredComplexes.length === 0 ? (
          <div className="py-20 text-center text-on_surface_variant/60">
            <p className="text-xl">No se encontraron complejos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredComplexes.map((complex) => (
              <ComplexCard
                key={complex._id}
                complex={complex}
                onNeedAuth={() => setLoginOpen(true)}
              />
            ))}
          </div>
        )}
      </main>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
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
      className="group block w-full overflow-hidden rounded-3xl border border-outline_variant/20 bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-surface_container_low"
    >
      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-primary/20 via-primary_container/20 to-secondary/15">
        {complex.imageUrl ? (
          <img
            src={complex.imageUrl}
            alt={complex.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl font-display font-semibold text-primary/70">Futbol</span>
        )}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-display font-semibold leading-tight text-on_surface">
            {complex.name}
          </h3>
          <div className="ml-2 flex shrink-0 items-center gap-1 text-sm text-yellow-400">
            <Star size={13} fill="currentColor" />
            <span>4.8</span>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-1.5 text-sm text-on_surface_variant">
          <MapPin size={13} />
          <span className="truncate">{complex.address || 'Tucuman'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="rounded-full bg-surface_container px-3 py-1 text-xs text-on_surface_variant">
            {complex.courtsCount ?? '-'} canchas
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
            Ver horarios
            <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </button>
  );
}
