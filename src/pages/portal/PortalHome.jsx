import { CalendarRange, Search, Sparkles } from 'lucide-react';
import ComplexDiscoverySection from '../../components/ComplexDiscoverySection';

export default function PortalHome() {
  return (
    <div className="space-y-8">
      <section className="poster-panel-dark poster-grid relative overflow-hidden px-6 py-10 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgb(var(--primary-green-rgb)/0.14),transparent_32%),linear-gradient(180deg,rgb(var(--bg-main-rgb)/0.16),transparent_100%)]" />

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div>
            <p className="poster-chip">
              <Sparkles size={14} />
              Portal cliente
            </p>
            <h1 className="mt-5 font-['Barlow_Condensed'] text-5xl uppercase leading-none text-white sm:text-6xl">
              Busca complejos
              <span className="mt-2 block text-primary">por disponibilidad real</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Filtra por amenities, fecha y horario. Ordenamos los resultados segun cuantos
              turnos y canchas libres tiene cada complejo, sin mostrarte una cancha aislada
              primero.
            </p>
          </div>

          <div className="grid gap-3">
            <QuickStat icon={Search} label="Busqueda" value="Por complejo" />
            <QuickStat icon={CalendarRange} label="Ranking" value="Mas turnos libres" />
          </div>
        </div>
      </section>

      <ComplexDiscoverySection
        title="Encuentra donde reservar hoy"
        description="Usa el buscador para comparar complejos completos, no solo la primera cancha disponible. Si eliges fecha y horario, el ranking prioriza los que tienen mas cupo real."
      />
    </div>
  );
}

function QuickStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Icon size={18} />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-['Barlow_Condensed'] text-3xl uppercase text-white">{value}</p>
    </div>
  );
}
