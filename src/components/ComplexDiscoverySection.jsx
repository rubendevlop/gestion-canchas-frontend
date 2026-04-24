import { useDeferredValue, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarRange,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  MessageCircleMore,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAPI } from '../services/api';
import { COMPLEX_AMENITIES } from '../constants/complexAmenities';
import {
  DEFAULT_BOOKING_HOURS,
  getTodayBookingDate,
} from '../utils/bookingHours';
import { buildWhatsAppUrl } from '../utils/whatsapp';

const EMPTY_FILTERS = {
  search: '',
  amenities: [],
  date: '',
  startTime: '',
  availableOnly: false,
};

function buildLocationLabel(complex) {
  return complex?.address || 'Tucuman';
}

function buildOpeningHoursLabel(complex) {
  const start = complex?.openingHours?.start || '08:00';
  const end = complex?.openingHours?.end || '23:00';
  return `${start} - ${end}`;
}

function buildAvailabilityHeadline(summary = {}) {
  if (!summary?.date) {
    return 'Explora por complejo';
  }

  if (!summary.hasAvailability) {
    return 'Sin turnos para ese filtro';
  }

  if (summary.startTime) {
    return `${summary.availableCourtsCount} canchas libres a las ${summary.startTime}`;
  }

  return `${summary.availableSlotsCount} turnos libres en ${summary.availableCourtsCount} canchas`;
}

function buildAvailabilityDetail(summary = {}) {
  if (!summary?.date) {
    return 'Ordenamos por cantidad de canchas activas y nunca te mostramos una cancha suelta primero.';
  }

  if (!summary.hasAvailability) {
    return 'Prueba otro horario o desactiva el filtro de solo disponibles.';
  }

  if (summary.startTime) {
    return `Complejo ordenado por cantidad de canchas que siguen libres a esa hora.`;
  }

  if (summary.nextAvailableTime) {
    return `Proximo horario con cupo: ${summary.nextAvailableTime}.`;
  }

  return 'Complejo ordenado por cantidad total de turnos disponibles.';
}

function buildOwnerMessage(complex) {
  return `Hola, quiero consultar por turnos en ${complex?.name || 'tu complejo'}.`;
}

export default function ComplexDiscoverySection({
  sectionId,
  eyebrow = 'Buscador avanzado',
  title,
  description,
  onNeedAuth = null,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = getTodayBookingDate();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [complexes, setComplexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    let cancelled = false;

    const loadComplexes = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const searchParams = new URLSearchParams();
        const trimmedSearch = deferredSearch.trim();

        if (trimmedSearch) {
          searchParams.set('search', trimmedSearch);
        }

        if (filters.amenities.length > 0) {
          searchParams.set('amenities', filters.amenities.join(','));
        }

        if (filters.date) {
          searchParams.set('date', filters.date);
        }

        if (filters.startTime) {
          searchParams.set('startTime', filters.startTime);
        }

        if (filters.availableOnly && filters.date) {
          searchParams.set('availableOnly', 'true');
        }

        const endpoint = searchParams.size
          ? `/complexes/discovery?${searchParams.toString()}`
          : '/complexes/discovery';
        const data = await fetchAPI(endpoint);

        if (!cancelled) {
          setComplexes(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setComplexes([]);
          setErrorMessage(error.message || 'No se pudo cargar el buscador de complejos.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadComplexes();

    return () => {
      cancelled = true;
    };
  }, [deferredSearch, filters.amenities, filters.date, filters.startTime, filters.availableOnly]);

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.amenities.length > 0 ||
    Boolean(filters.date) ||
    Boolean(filters.startTime) ||
    filters.availableOnly;
  const totalAvailableCourts = complexes.reduce(
    (sum, complex) => sum + Number(complex?.availabilitySummary?.availableCourtsCount || 0),
    0,
  );
  const totalAvailableSlots = complexes.reduce(
    (sum, complex) => sum + Number(complex?.availabilitySummary?.availableSlotsCount || 0),
    0,
  );

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFilters((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const handleDateChange = (value) => {
    setFilters((current) => ({
      ...current,
      date: value,
      startTime: value ? current.startTime : '',
      availableOnly: value ? current.availableOnly : false,
    }));
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
  };

  const handleOpenComplex = (complexId) => {
    if (!user) {
      onNeedAuth?.();
      return;
    }

    navigate(`/portal/complejo/${complexId}`);
  };

  return (
    <section id={sectionId} className="poster-panel-dark poster-grid px-5 py-6 sm:px-8 sm:py-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="poster-chip">
            <Sparkles size={14} />
            {eyebrow}
          </p>
          <h2 className="mt-5 font-['Barlow_Condensed'] text-4xl uppercase text-white sm:text-5xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            {description}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[26rem]">
          <StatPill label="Complejos" value={loading ? '--' : complexes.length} />
          <StatPill
            label={filters.date ? 'Canchas libres' : 'Canchas activas'}
            value={loading ? '--' : totalAvailableCourts}
          />
          <StatPill
            label={filters.date ? 'Turnos libres' : 'Filtro por amenities'}
            value={loading ? '--' : filters.date ? totalAvailableSlots : filters.amenities.length}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Buscar complejo
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
              <input
                type="text"
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Nombre o zona"
                className="neon-input pl-11"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Fecha
              </label>
              <div className="relative">
                <CalendarRange className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                <input
                  type="date"
                  min={today}
                  value={filters.date}
                  onChange={(event) => handleDateChange(event.target.value)}
                  className="neon-input pl-11"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Horario
              </label>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                <select
                  value={filters.startTime}
                  disabled={!filters.date}
                  onChange={(event) => updateFilter('startTime', event.target.value)}
                  className="neon-input appearance-none pl-11 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Todos los horarios</option>
                  {DEFAULT_BOOKING_HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={filters.availableOnly}
              disabled={!filters.date}
              onChange={(event) => updateFilter('availableOnly', event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary"
            />
            <span>Solo mostrar complejos con disponibilidad</span>
          </label>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Amenities del complejo
            </p>
            <div className="flex flex-wrap gap-2">
              {COMPLEX_AMENITIES.map((amenity) => {
                const active = filters.amenities.includes(amenity);

                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      active
                        ? 'border-primary/40 bg-primary/16 text-primary'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-primary/28 hover:text-white'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/25 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Limpiar filtros
          </button>
        </aside>

        <div>
          {errorMessage && (
            <div className="mb-5 rounded-[1.4rem] border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin text-primary" size={36} />
            </div>
          ) : complexes.length === 0 ? (
            <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] px-6 py-14 text-center">
              <p className="font-['Barlow_Condensed'] text-3xl uppercase text-white">
                No encontramos complejos
              </p>
              <p className="mt-3 text-sm text-slate-400">
                Ajusta fecha, horario o amenities para ampliar la busqueda.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {complexes.map((complex) => {
                const ownerWhatsAppUrl = buildWhatsAppUrl(
                  complex?.ownerContact?.phone,
                  buildOwnerMessage(complex),
                );
                const availabilitySummary = complex?.availabilitySummary || {};
                const amenities = Array.isArray(complex?.amenities) ? complex.amenities : [];

                return (
                  <article
                    key={complex._id}
                    className="overflow-hidden rounded-[1.6rem] border border-white/8 bg-white/[0.03] shadow-[0_18px_40px_-28px_rgb(var(--bg-main-rgb)/0.55)]"
                  >
                    <div className="relative h-56 overflow-hidden bg-[radial-gradient(circle_at_top,rgb(var(--primary-green-rgb)/0.22),transparent_28%),linear-gradient(180deg,rgb(var(--bg-main-rgb)/0.78)_0%,rgb(var(--bg-main-rgb))_100%)]">
                      {complex.imageUrl ? (
                        <img
                          src={complex.imageUrl}
                          alt={complex.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-['Teko'] text-7xl uppercase tracking-[0.08em] text-primary/90">
                            Club
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_16%,rgb(var(--bg-main-rgb)/0.12)_45%,rgb(var(--bg-main-rgb)/0.88)_100%)]" />
                      <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-full border border-white/10 bg-brand_bg/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          {complex.courtsCount ?? 0} canchas
                        </span>
                        <span className="rounded-full border border-white/10 bg-brand_bg/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                          {Number(availabilitySummary.minPricePerHour || 0) > 0
                            ? `Desde $${Number(availabilitySummary.minPricePerHour).toLocaleString('es-AR')}`
                            : 'Sin canchas activas'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <h3 className="font-['Barlow_Condensed'] text-3xl uppercase leading-none text-white">
                          {complex.name}
                        </h3>
                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                          <MapPin size={15} className="text-primary" />
                          <span className="truncate">{buildLocationLabel(complex)}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">
                          Horario general: {buildOpeningHoursLabel(complex)}
                        </p>
                      </div>

                      <div className="rounded-[1.3rem] border border-white/8 bg-brand_bg/48 px-4 py-4">
                        <p className="text-sm font-semibold text-white">
                          {buildAvailabilityHeadline(availabilitySummary)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {buildAvailabilityDetail(availabilitySummary)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {amenities.length > 0 ? (
                          amenities.slice(0, 5).map((amenity) => (
                            <span
                              key={amenity}
                              className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                            >
                              {amenity}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
                            Sin amenities cargados todavia
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => handleOpenComplex(complex._id)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-4 py-3 text-sm font-semibold text-on_primary shadow-[0_16px_34px_-18px_rgb(var(--primary-green-rgb)/0.75)] transition hover:brightness-110"
                        >
                          {user ? 'Ver complejo' : 'Ingresar para reservar'}
                          <ChevronRight size={16} />
                        </button>

                        {ownerWhatsAppUrl && (
                          <a
                            href={ownerWhatsAppUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#25D366]/35 bg-[#25D366]/12 px-4 py-3 text-sm font-semibold text-[#7DFFB0] transition hover:bg-[#25D366]/18"
                          >
                            <MessageCircleMore size={16} />
                            WhatsApp dueno
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-4">
      <p className="font-['Teko'] text-4xl leading-none text-white">{value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">
        {label}
      </p>
    </div>
  );
}
