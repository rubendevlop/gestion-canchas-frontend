import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarRange, ChevronRight, Clock, Loader2, Mail, MapPin, Phone, ShoppingBag, Star } from 'lucide-react';
import { fetchAPI } from '../../services/api';

export default function ComplexDetail() {
  const { complexId } = useParams();
  const [complex, setComplex] = useState(null);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    Promise.all([
      fetchAPI(`/complexes/${complexId}?clientVisible=true`),
      fetchAPI(`/courts?complexId=${complexId}&clientVisible=true`),
    ])
      .then(([complexData, courtsData]) => {
        setComplex(complexData);
        setCourts(courtsData);
      })
      .catch((error) => {
        setErrorMessage(error.message || 'Este complejo no esta disponible temporalmente.');
      })
      .finally(() => setLoading(false));
  }, [complexId]);

  if (loading) {
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
              {complex.openTime || '08:00'} - {complex.closeTime || '23:00'}
            </span>
            <span className="flex items-center gap-1.5 text-primary">
              <Star size={14} fill="currentColor" />
              4.8
            </span>
          </div>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4">
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
        </section>
      )}

      <section>
        <h2 className="mb-5 text-2xl font-display font-semibold text-white">Canchas disponibles</h2>
        <div className="space-y-4">
          {courts.map((court) => {
            const imageUrl = court.imageUrl || court.image || court.images?.[0] || '';

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
                    <div className="flex h-full items-center justify-center text-5xl text-brand_gray/25">Cancha</div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-6 px-6 py-5">
                  <div className="min-w-0">
                    <p className="text-base font-medium text-white">{court.name}</p>
                    <p className="mt-1 text-sm text-brand_gray">{court.sport || 'Futbol 5'}</p>
                    {court.description && (
                      <p className="mt-3 text-sm text-brand_gray/85">{court.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        ${court.pricePerHour?.toLocaleString('es-AR')}
                        <span className="text-xs font-normal text-brand_gray/65">/hr</span>
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          court.isAvailable !== false
                            ? 'bg-green-400/10 text-green-400'
                            : 'bg-red-400/10 text-red-400'
                        }`}
                      >
                        {court.isAvailable !== false ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                    <ChevronRight size={18} className="text-brand_gray/45 transition-colors group-hover:text-primary" />
                  </div>
                </div>
              </Link>
            );
          })}

          {courts.length === 0 && (
            <p className="app-shell-empty py-10">Este complejo no tiene canchas cargadas aun.</p>
          )}
        </div>
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
