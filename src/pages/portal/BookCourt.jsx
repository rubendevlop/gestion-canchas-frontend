import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  DollarSign,
  Loader2,
} from 'lucide-react';
import CourtFiltersPanel from '../../components/CourtFiltersPanel';
import { fetchAPI } from '../../services/api';
import {
  getPastBookingHoursForDate,
  getTodayBookingDate,
  normalizeBookingHours,
} from '../../utils/bookingHours';
import {
  buildCourtAvailabilityHint,
  buildCourtAvailabilityLabel,
  buildCourtsEndpoint,
  matchesCourtSearch,
} from '../../utils/courts';

const DEFAULT_PAYMENT_OPTIONS = {
  defaultMethod: 'ON_SITE',
  onSiteEnabled: true,
  onlineEnabled: false,
  provider: '',
  providerMode: '',
};

export default function BookCourt() {
  const { complexId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const today = getTodayBookingDate();

  const preselectedCourtId = searchParams.get('courtId') || '';

  const [complex, setComplex] = useState(null);
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(preselectedCourtId);
  const [filters, setFilters] = useState({
    search: '',
    date: today,
    startTime: '',
    features: [],
    availableOnly: false,
  });
  const [selectedHour, setSelectedHour] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_OPTIONS.defaultMethod);
  const [takenSlots, setTakenSlots] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [courtsLoading, setCourtsLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Reserva creada');
  const [successMessage, setSuccessMessage] = useState('Redirigiendo a tus reservas...');
  const [errorMessage, setErrorMessage] = useState('');

  const paymentOptions = complex?.reservationPaymentOptions || DEFAULT_PAYMENT_OPTIONS;
  const filteredCourts = courts.filter((court) => matchesCourtSearch(court, filters.search));
  const court = filteredCourts.find((item) => item._id === selectedCourt) || null;
  const availableHours = normalizeBookingHours(court?.bookingHours);
  const unavailableHours = new Set([
    ...takenSlots,
    ...getPastBookingHoursForDate(availableHours, filters.date),
  ]);
  const selectedCourtImage = court?.imageUrl || court?.image || court?.images?.[0] || '';

  useEffect(() => {
    setPageLoading(true);
    fetchAPI(`/complexes/${complexId}?clientVisible=true`)
      .then((complexData) => {
        setComplex(complexData);
        const nextPaymentMethod =
          complexData?.reservationPaymentOptions?.onlineEnabled === true
            ? String(complexData.reservationPaymentOptions.defaultMethod || 'ONLINE').toUpperCase()
            : 'ON_SITE';
        setPaymentMethod(nextPaymentMethod === 'ONLINE' ? 'ONLINE' : 'ON_SITE');
        setErrorMessage('');
      })
      .catch((error) => {
        setComplex(null);
        setErrorMessage(error.message || 'Este complejo no esta disponible para reservas.');
      })
      .finally(() => setPageLoading(false));
  }, [complexId]);

  useEffect(() => {
    if (paymentOptions.onlineEnabled) {
      return;
    }

    setPaymentMethod('ON_SITE');
  }, [paymentOptions.onlineEnabled]);

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
      .then((data) => {
        if (cancelled) return;
        setCourts(Array.isArray(data) ? data : []);
        setErrorMessage('');
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

  useEffect(() => {
    if (!selectedCourt || !filteredCourts.some((item) => item._id === selectedCourt)) {
      setSelectedCourt('');
      setSelectedHour('');
    }
  }, [filteredCourts, selectedCourt]);

  useEffect(() => {
    if (!selectedCourt || !filters.date) return;

    fetchAPI(`/reservations/taken?courtId=${selectedCourt}&date=${filters.date}`)
      .then((data) => {
        setTakenSlots(data.takenHours || []);
        setErrorMessage('');
      })
      .catch((error) => {
        setTakenSlots([]);
        if (error?.message) {
          setErrorMessage(error.message);
        }
      });
  }, [selectedCourt, filters.date]);

  useEffect(() => {
    if (selectedHour && unavailableHours.has(selectedHour)) {
      setSelectedHour('');
    }
  }, [selectedHour, unavailableHours]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => {
      if (key === 'date') {
        const nextDate = value || today;
        return {
          ...current,
          date: nextDate,
          startTime: current.startTime,
          availableOnly: nextDate ? current.availableOnly : false,
        };
      }

      if (key === 'startTime') {
        return {
          ...current,
          startTime: value,
        };
      }

      if (key === 'availableOnly') {
        return {
          ...current,
          availableOnly: Boolean(value),
        };
      }

      return { ...current, [key]: value };
    });

    if (key === 'date' || key === 'startTime') {
      setSelectedHour('');
    }
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
      date: today,
      startTime: '',
      features: [],
      availableOnly: false,
    });
    setSelectedHour('');
  };

  const handleBook = async () => {
    if (!selectedCourt || !filters.date || !selectedHour) return;
    setBooking(true);
    setErrorMessage('');

    try {
      const response = await fetchAPI('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          courtId: selectedCourt,
          date: filters.date,
          startTime: selectedHour,
          paymentMethod,
        }),
      });

      if (response.paymentSession?.checkoutUrl && response.providerConfigured) {
        window.location.assign(response.paymentSession.checkoutUrl);
        return;
      }

      setSuccessTitle(paymentMethod === 'ON_SITE' ? 'Reserva creada' : 'Reserva confirmada');
      setSuccessMessage(
        paymentMethod === 'ON_SITE'
          ? 'Tu reserva quedo registrada. Podras pagarla directamente en el complejo.'
          : 'Redirigiendo a tus reservas...',
      );
      setSuccess(true);
      setTimeout(() => navigate('/portal/mis-reservas'), 2000);
    } catch (error) {
      setErrorMessage(error.message || 'Error al realizar la reserva.');
    } finally {
      setBooking(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (!complex) {
    return <div className="py-20 text-center text-on_surface_variant">{errorMessage}</div>;
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <CheckCircle2 size={72} className="mb-6 text-green-500" />
        <h2 className="mb-2 font-display text-3xl font-bold text-on_surface">{successTitle}</h2>
        <p className="text-on_surface_variant">{successMessage}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-sm text-on_surface_variant transition-colors hover:text-on_surface"
      >
        <ChevronLeft size={16} />
        Volver al complejo
      </button>

      <h1 className="mb-8 font-display text-3xl font-bold text-on_surface">Reservar cancha</h1>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/6 px-5 py-4 text-sm text-red-500">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Step number={1} title="Filtra las canchas del complejo">
            <CourtFiltersPanel
              filters={filters}
              onChange={handleFilterChange}
              onToggleFeature={toggleFeature}
              onReset={resetFilters}
              description="Usa fecha, horario preferido y caracteristicas para ver primero las canchas que mejor encajan en este complejo."
            />
          </Step>

          <Step number={2} title="Elige la cancha">
            {courtsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : filteredCourts.length === 0 ? (
              <p className="rounded-2xl border border-outline_variant/20 bg-surface_container_low px-4 py-4 text-sm text-on_surface_variant">
                No hay canchas que coincidan con los filtros elegidos.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredCourts.map((item) => {
                  const imageUrl = item.imageUrl || item.image || item.images?.[0] || '';
                  const summary = item.availabilitySummary || {};

                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => {
                        setSelectedCourt(item._id);
                        if (filters.startTime && summary.availableAtRequestedTime) {
                          setSelectedHour(filters.startTime);
                        } else {
                          setSelectedHour('');
                        }
                      }}
                      className={`overflow-hidden rounded-2xl border text-left transition-all ${
                        selectedCourt === item._id
                          ? 'border-primary/35 bg-primary/10 text-on_surface shadow-[0_18px_38px_-24px_rgb(var(--primary-green-rgb)/0.22)]'
                          : 'border-outline_variant/20 bg-white text-on_surface_variant hover:border-primary/25 hover:bg-surface_container_low hover:text-on_surface'
                      }`}
                    >
                      <div className="h-40 bg-gradient-to-br from-surface_container_low to-surface_container">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-5xl text-on_surface_variant/30">
                            Cancha
                          </div>
                        )}
                      </div>

                      <div className="space-y-4 px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-on_surface">{item.name}</p>
                            <p className="mt-0.5 text-xs text-on_surface_variant">
                              {item.sport || 'Futbol'}
                            </p>
                          </div>
                          <p className="font-semibold text-primary">
                            ${item.pricePerHour?.toLocaleString('es-AR')}/hr
                          </p>
                        </div>

                        <div className="rounded-2xl border border-outline_variant/15 bg-surface_container_low px-4 py-3">
                          <p
                            className={`text-sm font-semibold ${
                              summary.hasAvailability ? 'text-primary' : 'text-red-500'
                            }`}
                          >
                            {buildCourtAvailabilityLabel(summary)}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-on_surface_variant">
                            {buildCourtAvailabilityHint(summary)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(item.features) && item.features.length > 0 ? (
                            item.features.slice(0, 4).map((feature) => (
                              <span
                                key={feature}
                                className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary"
                              >
                                {feature}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full border border-outline_variant/15 bg-surface_container px-3 py-1 text-[11px] text-on_surface_variant">
                              Sin caracteristicas cargadas
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Step>

          <Step number={3} title="Elige el horario final">
            {!court ? (
              <p className="rounded-2xl border border-outline_variant/20 bg-surface_container_low px-4 py-4 text-sm text-on_surface_variant">
                Selecciona una cancha para ver sus horarios libres.
              </p>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-on_surface_variant">
                  <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 font-semibold text-primary">
                    {court.name}
                  </span>
                  <span>Fecha: {filters.date}</span>
                  {filters.startTime && <span>Horario preferido: {filters.startTime}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {availableHours.map((hour) => {
                    const taken = unavailableHours.has(hour);
                    const preferred = filters.startTime === hour;

                    return (
                      <button
                        key={hour}
                        disabled={taken}
                        onClick={() => setSelectedHour(hour)}
                        className={`rounded-2xl border py-3 text-sm font-semibold transition-all ${
                          taken
                            ? 'cursor-not-allowed border-outline_variant/15 bg-surface_container_low text-outline'
                            : selectedHour === hour
                              ? 'border-primary/35 bg-primary/12 text-primary'
                              : preferred
                                ? 'border-primary/25 bg-primary/8 text-on_surface'
                                : 'border-outline_variant/20 bg-white text-on_surface_variant hover:border-primary/25 hover:text-on_surface'
                        }`}
                      >
                        {taken ? <s>{hour}</s> : hour}
                      </button>
                    );
                  })}
                </div>
                {availableHours.length === 0 && (
                  <p className="rounded-2xl border border-outline_variant/20 bg-surface_container_low px-4 py-4 text-sm text-on_surface_variant">
                    Esta cancha no tiene horarios habilitados todavia.
                  </p>
                )}
              </>
            )}
          </Step>

          <Step number={4} title="Como quieres pagar">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PaymentMethodCard
                icon={DollarSign}
                title="Pagar en cancha"
                description="Reservas tu horario ahora y lo abonas cuando llegues al complejo."
                selected={paymentMethod === 'ON_SITE'}
                onClick={() => setPaymentMethod('ON_SITE')}
              />
              <PaymentMethodCard
                icon={CreditCard}
                title="Pagar online"
                description={
                  paymentOptions.onlineEnabled
                    ? 'Te enviamos al checkout de Mercado Pago para dejar la reserva abonada.'
                    : 'Por ahora este complejo no tiene cobro online activo para reservas.'
                }
                selected={paymentMethod === 'ONLINE'}
                disabled={!paymentOptions.onlineEnabled}
                onClick={() => setPaymentMethod('ONLINE')}
              />
            </div>
            {!paymentOptions.onlineEnabled && (
              <p className="mt-4 rounded-2xl border border-outline_variant/20 bg-surface_container_low px-4 py-4 text-sm text-on_surface_variant">
                Este complejo acepta reservas con pago en cancha. Cuando el owner active Mercado Pago,
                tambien podras abonarlas online.
              </p>
            )}
          </Step>
        </div>

        {selectedCourt && filters.date && selectedHour && (
          <div className="rounded-2xl border border-outline_variant/20 bg-white p-6 shadow-[0_18px_40px_-26px_rgb(var(--bg-main-rgb)/0.14)]">
            <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-surface_container_low to-surface_container">
              {selectedCourtImage ? (
                <img
                  src={selectedCourtImage}
                  alt={court?.name}
                  loading="lazy"
                  decoding="async"
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center text-5xl text-on_surface_variant/30">
                  Cancha
                </div>
              )}
            </div>

            <h3 className="mb-3 font-semibold text-on_surface">Resumen</h3>
            <div className="mb-5 space-y-2 text-sm text-on_surface_variant">
              <div className="flex justify-between gap-4">
                <span>Cancha</span>
                <span className="font-medium text-on_surface">{court?.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Fecha</span>
                <span className="font-medium text-on_surface">{filters.date}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Hora</span>
                <span className="font-medium text-on_surface">{selectedHour}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Pago</span>
                <span className="font-medium text-on_surface">
                  {paymentMethod === 'ONLINE' ? 'Online con Mercado Pago' : 'En cancha'}
                </span>
              </div>
              <div className="mt-3 flex justify-between text-base font-semibold">
                <span className="text-on_surface">Total</span>
                <span className="text-primary">${court?.pricePerHour?.toLocaleString('es-AR')}</span>
              </div>
            </div>
            <button
              onClick={handleBook}
              disabled={booking}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary_container to-primary py-4 font-bold text-on_primary transition-all hover:brightness-110 disabled:opacity-50"
            >
              {booking ? <Loader2 className="animate-spin" size={18} /> : null}
              {booking
                ? 'Procesando...'
                : paymentMethod === 'ONLINE'
                  ? 'Reservar y pagar online'
                  : 'Reservar y pagar en cancha'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
          {number}
        </div>
        <h2 className="font-semibold text-on_surface">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function PaymentMethodCard({
  icon: Icon,
  title,
  description,
  selected = false,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl border px-5 py-4 text-left transition-all ${
        disabled
          ? 'cursor-not-allowed border-outline_variant/15 bg-surface_container_low text-outline'
          : selected
            ? 'border-primary/35 bg-primary/10 text-on_surface shadow-[0_18px_38px_-24px_rgb(var(--primary-green-rgb)/0.22)]'
            : 'border-outline_variant/20 bg-white text-on_surface_variant hover:border-primary/25 hover:bg-surface_container_low hover:text-on_surface'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            disabled ? 'bg-surface_container text-outline' : 'bg-primary/10 text-primary'
          }`}
        >
          <Icon size={20} />
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6">{description}</p>
        </div>
      </div>
    </button>
  );
}
