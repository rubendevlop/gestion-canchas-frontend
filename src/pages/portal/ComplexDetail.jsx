import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarRange,
  ChevronRight,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageCircleMore,
  Phone,
  ShoppingBag,
  Star,
} from 'lucide-react';
import CourtFiltersPanel from '../../components/CourtFiltersPanel';
import { fetchAPI } from '../../services/api';
import {
  buildCourtAvailabilityHint,
  buildCourtAvailabilityLabel,
  buildCourtsEndpoint,
  matchesCourtSearch,
} from '../../utils/courts';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

export default function ComplexDetail() {
  const { complexId } = useParams();
  const [complex, setComplex] = useState(null);
  const [courts, setCourts] = useState([]);
  const [complexLoading, setComplexLoading] = useState(true);
  const [courtsLoading, setCourtsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    date: '',
    startTime: '',
    features: [],
    availableOnly: false,
  });
  const [errorMessage, setErrorMessage] = useState('');

  const filteredCourts = courts.filter((court) => matchesCourtSearch(court, filters.search));

  useEffect(() => {
    setComplexLoading(true);
    fetchAPI(`/complexes/${complexId}?clientVisible=true`)
      .then((complexData) => {
        setComplex(complexData);
        setErrorMessage('');
      })
      .catch((error) => {
        setComplex(null);
        setErrorMessage(error.message || 'Este complejo no esta disponible temporalmente.');
      })
      .finally(() => setComplexLoading(false));
  }, [complexId]);

  useEffect(() => {
    let cancelled = false;

    setCourtsLoading(true);
    fetchAPI(
      buildCourtsEndpoint(complexId, {
        date: filters.date,
        startTime: filters.startTime,
        features: filters.features,
        availableOnly: filters.availableOnly,
      }),
    )
      .then((courtsData) => {
        if (cancelled) return;
        setCourts(Array.isArray(courtsData) ? courtsData : []);
      })
      .catch((error) => {
        if (cancelled) return;
        setCourts([]);
        setErrorMessage(error.message || 'No se pudieron cargar las canchas del complejo.');
      })
      .finally(() => {
        if (!cancelled) {
          setCourtsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [complexId, filters.date, filters.startTime, filters.features, filters.availableOnly]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => {
      if (key === 'date') {
        return {
          ...current,
          date: value,
          startTime: value ? current.startTime : '',
          availableOnly: value ? current.availableOnly : false,
        };
      }

      return { ...current, [key]: value };
    });
  };

  const toggleFeature = (feature) => {
    setFilters((current) => ({
      ...current,
      features: current.features.includes(feature)
        ? current.features.filter((item) => item !== feature)
        : [...current.features, feature],
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      date: '',
      startTime: '',
      features: [],
      availableOnly: false,
    });
  };

  if (complexLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (!complex) {
    return <div className="app-shell-empty py-20">{errorMessage || 'Complejo no encontrado.'}</div>;
  }

  const ownerPhone = String(complex.ownerContact?.phone || '').trim();
  const ownerEmail = String(complex.ownerContact?.email || '').trim();
  const ownerWhatsAppUrl = buildWhatsAppUrl(
    ownerPhone,
    `Hola, quiero consultar por turnos en ${complex.name}.`,
  );
  const hasOwnerContact = Boolean(ownerPhone || ownerEmail);
  const reservationPaymentOptions = complex.reservationPaymentOptions || {
    onSiteEnabled: true,
    onlineEnabled: false,
  };

  return (
    <div>
      <div className="poster-panel-dark relative mb-8 flex h-64 items-center justify-center overflow-hidden rounded-3xl shadow-[0_24px_70px_-42px_rgb(var(--bg-main-rgb)/0.24)]">
        {complex.imageUrl ? (
          <img
            src={complex.imageUrl}
            alt={complex.name}
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-8xl">Futbol</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand_bg via-brand_bg/55 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="mb-2 text-4xl font-display font-bold text-white">{complex.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-brand_gray">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {complex.address || 'Buenos Aires'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {complex.openingHours?.start || '08:00'} - {complex.openingHours?.end || '23:00'}
            </span>
            <span className="flex items-center gap-1.5 text-primary">
              <Star size={14} fill="currentColor" />
              4.8
            </span>
          </div>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to={`/portal/complejo/${complexId}/reservar`}
          className="app-shell-button-primary flex py-5 text-lg font-semibold"
        >
          <CalendarRange size={22} />
          Reservar cancha
        </Link>
        <Link
          to={`/portal/complejo/${complexId}/tienda`}
          className="app-shell-button-secondary flex py-5 text-lg font-semibold"
        >
          <ShoppingBag size={22} />
          Ver tienda
        </Link>
        {ownerWhatsAppUrl && (
          <a
            href={ownerWhatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#25D366]/35 bg-[#25D366]/12 px-4 py-5 text-lg font-semibold text-[#7DFFB0] transition hover:bg-[#25D366]/18"
          >
            <MessageCircleMore size={22} />
            WhatsApp del dueno
          </a>
        )}
      </div>

      <div className="app-shell-panel mb-10 flex flex-wrap items-center gap-3 px-5 py-4 text-sm text-brand_gray">
        <span className="font-medium text-white">Reservas:</span>
        {reservationPaymentOptions.onSiteEnabled && (
          <span className="rounded-full bg-amber-400/10 px-3 py-1 font-semibold text-amber-700">
            Pagar en cancha
          </span>
        )}
        {reservationPaymentOptions.onlineEnabled ? (
          <span className="rounded-full border border-primary/20 bg-primary/12 px-3 py-1 font-semibold text-primary">
            Pago online
          </span>
        ) : (
          <span>El pago online todavia no esta habilitado en este complejo.</span>
        )}
      </div>

      <section className="app-shell-panel mb-10 p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-display font-semibold text-white">Amenities del complejo</h2>
          <p className="mt-2 text-sm text-brand_gray">
            Estos servicios tambien se usan como filtros cuando buscas donde jugar.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {Array.isArray(complex.amenities) && complex.amenities.length > 0 ? (
            complex.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
              >
                {amenity}
              </span>
            ))
          ) : (
            <p className="text-sm text-brand_gray">Este complejo todavia no cargo amenities publicos.</p>
          )}
        </div>
      </section>

      {hasOwnerContact && (
        <section className="app-shell-panel mb-10 p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-display font-semibold text-white">Contacto</h2>
            <p className="mt-2 text-sm text-brand_gray">
              Si necesitas resolver algo con tu reserva o compra, estos son los datos del owner del complejo.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ContactRow icon={Phone} label="Telefono" value={ownerPhone} />
            <ContactRow icon={Mail} label="Correo" value={ownerEmail} />
          </div>

          {ownerWhatsAppUrl && (
            <a
              href={ownerWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-[#25D366]/35 bg-[#25D366]/12 px-4 py-3 text-sm font-semibold text-[#7DFFB0] transition hover:bg-[#25D366]/18"
            >
              <MessageCircleMore size={18} />
              Escribir por WhatsApp
            </a>
          )}
        </section>
      )}

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-display font-semibold text-white">Canchas del complejo</h2>
          <p className="mt-2 text-sm text-brand_gray">
            Filtra por caracteristicas de la cancha y por disponibilidad para una fecha u horario puntual.
          </p>
        </div>

        <div className="mb-6">
          <CourtFiltersPanel
            filters={filters}
            onChange={handleFilterChange}
            onToggleFeature={toggleFeature}
            onReset={resetFilters}
            description="Compara las canchas de este complejo por caracteristicas como indoor, tipo de piso o disponibilidad puntual."
          />
        </div>

        {courtsLoading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourts.map((court) => {
              const imageUrl = court.imageUrl || court.image || court.images?.[0] || '';
              const summary = court.availabilitySummary || {};

              return (
                <Link
                  key={court._id}
                  to={`/portal/complejo/${complexId}/reservar?courtId=${court._id}`}
                  className="group app-shell-panel grid overflow-hidden transition-all hover:border-primary/30 hover:bg-white/[0.06] md:grid-cols-[220px_minmax(0,1fr)]"
                >
                  <div className="h-44 bg-gradient-to-br from-surface_container to-surface_container_high md:h-full">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={court.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl text-brand_gray/25">
                        Cancha
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-6 px-6 py-5">
                    <div className="min-w-0">
                      <p className="text-base font-medium text-white">{court.name}</p>
                      <p className="mt-1 text-sm text-brand_gray">{court.sport || 'Futbol'}</p>
                      {court.description && (
                        <p className="mt-3 text-sm text-brand_gray/85">{court.description}</p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {Array.isArray(court.features) && court.features.length > 0 ? (
                          court.features.map((feature) => (
                            <span
                              key={feature}
                              className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary"
                            >
                              {feature}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-brand_gray">
                            Sin caracteristicas cargadas
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          ${court.pricePerHour?.toLocaleString('es-AR')}
                          <span className="text-xs font-normal text-brand_gray/65">/hr</span>
                        </p>
                        <p
                          className={`mt-2 text-sm font-semibold ${
                            summary.hasAvailability ? 'text-primary' : 'text-red-400'
                          }`}
                        >
                          {buildCourtAvailabilityLabel(summary)}
                        </p>
                        <p className="mt-1 text-xs text-brand_gray/80">
                          {buildCourtAvailabilityHint(summary)}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-brand_gray/45 transition-colors group-hover:text-primary" />
                    </div>
                  </div>
                </Link>
              );
            })}

            {filteredCourts.length === 0 && (
              <p className="app-shell-empty py-10">
                No hay canchas que coincidan con los filtros elegidos dentro de este complejo.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand_gray/70">{label}</p>
          <p className="mt-1 break-all text-sm font-medium text-white">{value || 'No disponible'}</p>
        </div>
      </div>
    </div>
  );
}
