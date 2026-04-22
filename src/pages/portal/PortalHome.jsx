import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAPI } from '../../services/api';
import { MapPin, Star, ChevronRight, Search, Loader2 } from 'lucide-react';

export default function PortalHome() {
  const [complexes, setComplexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAPI('/complexes?clientVisible=true')
      .then((data) => setComplexes(data))
      .catch(() => setComplexes([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = complexes.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <section className="poster-panel-dark poster-grid relative mb-10 px-6 py-16 text-center sm:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--primary-green-rgb)/0.14),transparent_36%),radial-gradient(circle_at_bottom_right,rgb(var(--text-white-rgb)/0.08),transparent_22%)]" />

        <div className="relative mx-auto max-w-3xl">
          <p className="poster-chip mx-auto w-fit">Portal cliente</p>
          <h1 className="mb-4 mt-6 text-5xl font-display font-bold leading-tight text-white">
            Reserva tu cancha
            <br />
            <span className="text-primary">en minutos.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-brand_gray">
            Encontra un complejo, elegi tu horario y entra a jugar con una interfaz mas viva y mas de club.
          </p>
          <div className="relative mx-auto max-w-lg">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar complejo o ciudad..."
              className="app-shell-input py-4 pl-14 pr-6 text-base"
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="app-shell-empty py-20">
          <p className="text-xl">No se encontraron complejos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((complex) => (
            <ComplexCard key={complex._id} complex={complex} />
          ))}
        </div>
      )}
    </div>
  );
}

function ComplexCard({ complex }) {
  return (
    <Link
      to={`/portal/complejo/${complex._id}`}
      className="group app-shell-panel block overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white/[0.06]"
    >
      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-primary/18 via-primary/8 to-white/5">
        {complex.imageUrl ? (
          <img
            src={complex.imageUrl}
            alt={complex.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-5xl">Futbol</span>
        )}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-display font-semibold leading-tight text-white">{complex.name}</h3>
          <div className="ml-2 flex shrink-0 items-center gap-1 text-sm text-primary">
            <Star size={13} fill="currentColor" />
            <span>4.8</span>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-1.5 text-sm text-brand_gray">
          <MapPin size={13} />
          <span className="truncate">{complex.address || 'Buenos Aires'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-brand_gray">
            {complex.courtsCount ?? '-'} canchas
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
            Ver horarios <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
