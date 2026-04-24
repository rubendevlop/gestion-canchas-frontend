import { CalendarRange, Clock, Search } from 'lucide-react';
import { COURT_FEATURES } from '../constants/courtFeatures';
import { DEFAULT_BOOKING_HOURS, getTodayBookingDate } from '../utils/bookingHours';

const INPUT_CLS =
  'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/35 focus:outline-none';

export default function CourtFiltersPanel({
  filters,
  onChange,
  onToggleFeature,
  onReset,
  title = 'Filtra las canchas',
  description = 'Refina por caracteristicas y disponibilidad dentro del complejo.',
}) {
  const today = getTodayBookingDate();

  return (
    <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
      <div className="mb-5">
        <h3 className="font-['Barlow_Condensed'] text-3xl uppercase text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Buscar cancha
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
            <input
              type="text"
              value={filters.search}
              onChange={(event) => onChange('search', event.target.value)}
              placeholder="Nombre, deporte o detalle"
              className={`${INPUT_CLS} pl-11`}
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Fecha
          </span>
          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
            <input
              type="date"
              min={today}
              value={filters.date}
              onChange={(event) => onChange('date', event.target.value)}
              className={`${INPUT_CLS} pl-11`}
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Horario preferido
          </span>
          <div className="relative">
            <Clock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
            <select
              value={filters.startTime}
              disabled={!filters.date}
              onChange={(event) => onChange('startTime', event.target.value)}
              className={`${INPUT_CLS} appearance-none pl-11 disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <option value="">Cualquier horario</option>
              {DEFAULT_BOOKING_HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>

      <label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={filters.availableOnly}
          disabled={!filters.date}
          onChange={(event) => onChange('availableOnly', event.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary"
        />
        <span>Solo mostrar canchas disponibles para ese filtro</span>
      </label>

      <div className="mt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Caracteristicas de la cancha
        </p>
        <div className="flex flex-wrap gap-2">
          {COURT_FEATURES.map((feature) => {
            const active = filters.features.includes(feature);

            return (
              <button
                key={feature}
                type="button"
                onClick={() => onToggleFeature(feature)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? 'border-primary/40 bg-primary/16 text-primary'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-primary/28 hover:text-white'
                }`}
              >
                {feature}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/25 hover:bg-white/[0.06]"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
