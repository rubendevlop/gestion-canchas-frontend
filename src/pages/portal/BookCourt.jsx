import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, CreditCard, DollarSign, Loader2 } from 'lucide-react';
import { fetchAPI } from '../../services/api';
import {
  getPastBookingHoursForDate,
  getTodayBookingDate,
  normalizeBookingHours,
} from '../../utils/bookingHours';

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
  const [selectedDate, setSelectedDate] = useState(() => today);
  const [selectedHour, setSelectedHour] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_OPTIONS.defaultMethod);
  const [takenSlots, setTakenSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Reserva creada');
  const [successMessage, setSuccessMessage] = useState('Redirigiendo a tus reservas...');
  const [errorMessage, setErrorMessage] = useState('');

  const paymentOptions = complex?.reservationPaymentOptions || DEFAULT_PAYMENT_OPTIONS;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAPI(`/complexes/${complexId}?clientVisible=true`),
      fetchAPI(`/courts?complexId=${complexId}&clientVisible=true`),
    ])
      .then(([complexData, courtsData]) => {
        setComplex(complexData);
        setCourts(courtsData);
        const nextPaymentMethod =
          complexData?.reservationPaymentOptions?.onlineEnabled === true
            ? String(complexData.reservationPaymentOptions.defaultMethod || 'ONLINE').toUpperCase()
            : 'ON_SITE';
        setPaymentMethod(nextPaymentMethod === 'ONLINE' ? 'ONLINE' : 'ON_SITE');
        setErrorMessage('');
      })
      .catch((error) => {
        setComplex(null);
        setCourts([]);
        setErrorMessage(error.message || 'Este complejo no esta disponible para reservas.');
      })
      .finally(() => setLoading(false));
  }, [complexId]);

  useEffect(() => {
    if (paymentOptions.onlineEnabled) {
      return;
    }

    setPaymentMethod('ON_SITE');
  }, [paymentOptions.onlineEnabled]);

  useEffect(() => {
    if (!selectedCourt || !selectedDate) return;

    fetchAPI(`/reservations/taken?courtId=${selectedCourt}&date=${selectedDate}`)
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
  }, [selectedCourt, selectedDate]);

  const handleBook = async () => {
    if (!selectedCourt || !selectedDate || !selectedHour) return;
    setBooking(true);
    setErrorMessage('');

    try {
      const response = await fetchAPI('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          courtId: selectedCourt,
          date: selectedDate,
          startTime: selectedHour,
          paymentMethod,
        }),
      });

      if (response.paymentSession?.checkoutUrl && response.providerConfigured) {
        window.location.assign(response.paymentSession.checkoutUrl);
        return;
      } else {
        setSuccessTitle(paymentMethod === 'ON_SITE' ? 'Reserva creada' : 'Reserva confirmada');
        setSuccessMessage(
          paymentMethod === 'ON_SITE'
            ? 'Tu reserva quedo registrada. Podras pagarla directamente en el complejo.'
            : 'Redirigiendo a tus reservas...',
        );
        setSuccess(true);
        setTimeout(() => navigate('/portal/mis-reservas'), 2000);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Error al realizar la reserva.');
    } finally {
      setBooking(false);
    }
  };

  const court = courts.find((item) => item._id === selectedCourt);
  const availableHours = normalizeBookingHours(court?.bookingHours);
  const unavailableHours = new Set([
    ...takenSlots,
    ...getPastBookingHoursForDate(availableHours, selectedDate),
  ]);
  const selectedCourtImage = court?.imageUrl || court?.image || court?.images?.[0] || '';

  useEffect(() => {
    if (selectedHour && unavailableHours.has(selectedHour)) {
      setSelectedHour('');
    }
  }, [selectedHour, unavailableHours]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (!courts.length && errorMessage) {
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
    <div className="mx-auto max-w-4xl">
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

      <Step number={1} title="Elegi la cancha">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {courts.map((item) => {
            const imageUrl = item.imageUrl || item.image || item.images?.[0] || '';

            return (
              <button
                key={item._id}
                onClick={() => {
                  setSelectedCourt(item._id);
                  setSelectedHour('');
                }}
                className={`overflow-hidden rounded-2xl border text-left transition-all ${
                  selectedCourt === item._id
                    ? 'border-primary/35 bg-primary/10 text-on_surface shadow-[0_18px_38px_-24px_rgba(47,158,68,0.22)]'
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
                    <div className="flex h-full items-center justify-center text-5xl text-on_surface_variant/30">Cancha</div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-0.5 text-xs text-on_surface_variant">{item.sport || 'Futbol 5'}</p>
                  </div>
                  <p className="font-semibold text-primary">${item.pricePerHour?.toLocaleString('es-AR')}/hr</p>
                </div>
              </button>
            );
          })}
        </div>
      </Step>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Step number={2} title="Elegi la fecha">
            <input
              type="date"
              value={selectedDate}
              min={today}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setSelectedHour('');
              }}
              className="w-full rounded-2xl border border-outline_variant/25 bg-white px-5 py-3.5 text-sm text-on_surface transition-all focus:border-primary/50 focus:outline-none"
            />
          </Step>

          <Step number={3} title="Elegi el horario">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {availableHours.map((hour) => {
                const taken = unavailableHours.has(hour);
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

        {selectedCourt && selectedDate && selectedHour && (
          <div className="rounded-2xl border border-outline_variant/20 bg-white p-6 shadow-[0_18px_40px_-26px_rgba(24,36,24,0.18)]">
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
                <div className="flex h-44 items-center justify-center text-5xl text-on_surface_variant/30">Cancha</div>
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
                <span className="font-medium text-on_surface">{selectedDate}</span>
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
            ? 'border-primary/35 bg-primary/10 text-on_surface shadow-[0_18px_38px_-24px_rgba(47,158,68,0.22)]'
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
