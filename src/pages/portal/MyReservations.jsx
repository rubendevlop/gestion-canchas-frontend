import { useState, useEffect } from 'react';
import { fetchAPI } from '../../services/api';
import { CalendarRange, Clock, CreditCard, MapPin, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppModal from '../../components/AppModal';
import {
  getReservationPaymentMethodMeta,
  resolveReservationPaymentMethod,
} from '../../utils/reservationPayments';

const STATUS_STYLES = {
  confirmed: { label: 'Confirmada', cls: 'bg-green-400/10 text-green-500' },
  pending: { label: 'Pendiente', cls: 'bg-yellow-400/10 text-yellow-600' },
  cancelled: { label: 'Cancelada', cls: 'bg-red-400/10 text-red-500' },
};

const PAYMENT_STYLES = {
  PAID: { label: 'Pagada', cls: 'bg-green-400/10 text-green-500' },
  PARTIAL: { label: 'Pago parcial', cls: 'bg-yellow-400/10 text-yellow-600' },
  UNPAID: { label: 'Sin pagar', cls: 'bg-red-400/10 text-red-500' },
  REFUNDED: { label: 'Reembolsada', cls: 'bg-sky-400/10 text-sky-500' },
};

function getReservationDateTime(reservation) {
  const rawDate = String(reservation?.date || '');
  const dateOnly = rawDate.includes('T') ? rawDate.slice(0, 10) : rawDate;
  const parsed = new Date(`${dateOnly}T${reservation?.startTime || '00:00'}`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatReservationDate(value) {
  const rawDate = String(value || '');
  const dateOnly = rawDate.includes('T') ? rawDate.slice(0, 10) : rawDate;
  const parsed = new Date(`${dateOnly}T00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value || '-';
  }

  return parsed.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingReservationId, setPayingReservationId] = useState('');
  const [dialogModal, setDialogModal] = useState(null);

  useEffect(() => {
    fetchAPI('/reservations/mine')
      .then(setReservations)
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    setDialogModal({
      title: 'Cancelar reserva',
      description: 'Se cancelara esta reserva y el horario volvera a liberarse.',
      tone: 'error',
      actions: [
        { label: 'Volver', variant: 'secondary', onClick: () => setDialogModal(null) },
        {
          label: 'Cancelar reserva',
          autoFocus: true,
          onClick: async () => {
            setDialogModal(null);
            try {
              await fetchAPI(`/reservations/${id}/cancel`, { method: 'PATCH' });
              setReservations((prev) =>
                prev.map((r) => (r._id === id ? { ...r, status: 'cancelled' } : r)),
              );
            } catch (err) {
              setDialogModal({
                title: 'No se pudo cancelar la reserva',
                description: err.message || 'Error al cancelar.',
                tone: 'error',
              });
            }
          },
        },
      ],
    });
  };

  const handlePayOnline = async (id) => {
    setPayingReservationId(id);

    try {
      const response = await fetchAPI(`/reservations/${id}/pay`, { method: 'POST' });
      if (!response.paymentSession?.checkoutUrl) {
        throw new Error('No se pudo generar el checkout de Mercado Pago.');
      }

      window.location.assign(response.paymentSession.checkoutUrl);
    } catch (err) {
      setDialogModal({
        title: 'No se pudo iniciar el pago online',
        description: err.message || 'No se pudo iniciar el pago online.',
        tone: 'error',
      });
    } finally {
      setPayingReservationId('');
    }
  };

  const upcoming = reservations.filter((r) => {
    const reservationDateTime = getReservationDateTime(r);
    return reservationDateTime && reservationDateTime >= new Date() && r.status !== 'cancelled';
  });

  const past = reservations.filter((r) => {
    const reservationDateTime = getReservationDateTime(r);
    return !reservationDateTime || reservationDateTime < new Date() || r.status === 'cancelled';
  });

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl font-bold text-white">Mis reservas</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      ) : reservations.length === 0 ? (
        <div className="app-shell-empty py-24">
          <CalendarRange size={56} className="mx-auto mb-4 text-brand_gray/35" strokeWidth={1} />
          <p className="mb-6 text-brand_gray">Todavia no tienes reservas.</p>
          <Link
            to="/portal"
            className="app-shell-button-primary px-6 py-3 text-sm"
          >
            Buscar un complejo
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand_gray">
                Proximas
              </h2>
              <div className="space-y-3">
                {upcoming.map((r) => (
                  <ReservationCard
                    key={r._id}
                    r={r}
                    onCancel={handleCancel}
                    onPayOnline={handlePayOnline}
                    paying={payingReservationId === r._id}
                  />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand_gray">
                Historial
              </h2>
              <div className="space-y-3 opacity-75">
                {past.map((r) => (
                  <ReservationCard key={r._id} r={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <AppModal
        open={Boolean(dialogModal)}
        title={dialogModal?.title || ''}
        description={dialogModal?.description || ''}
        tone={dialogModal?.tone || 'error'}
        actions={dialogModal?.actions || []}
        onClose={() => setDialogModal(null)}
      />
    </div>
  );
}

function ReservationCard({ r, onCancel, onPayOnline, paying = false }) {
  const normalizedStatus = String(r.status || '').toLowerCase();
  const s = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.pending;
  const payment = PAYMENT_STYLES[String(r.paymentStatus || '').toUpperCase()] || PAYMENT_STYLES.UNPAID;
  const paymentMethodMeta = getReservationPaymentMethodMeta(r);
  const reservationDateTime = getReservationDateTime(r);
  const canCancel = normalizedStatus !== 'cancelled' && reservationDateTime && reservationDateTime > new Date();
  const canPayOnline =
    canCancel &&
    String(r.paymentStatus || '').toUpperCase() === 'UNPAID' &&
    resolveReservationPaymentMethod(r) === 'ONLINE';

  return (
    <div className="app-shell-panel flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <CalendarRange size={22} />
        </div>
        <div>
          <p className="font-semibold text-white">{r.court?.name || 'Cancha'}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-3 text-sm text-brand_gray">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {r.complex?.name || r.court?.complexId || 'Complejo'}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatReservationDate(r.date)} - {r.startTime}
            </span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${payment.cls}`}>{payment.label}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${paymentMethodMeta.cls}`}>
          {paymentMethodMeta.shortLabel}
        </span>
        {canPayOnline && onPayOnline && (
          <button
            type="button"
            onClick={() => onPayOnline(r._id)}
            disabled={paying}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/12 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/18 disabled:opacity-60"
          >
            {paying ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
            {paying ? 'Procesando...' : 'Pagar online'}
          </button>
        )}
        {canCancel && onCancel && (
          <button onClick={() => onCancel(r._id)} className="text-brand_gray transition-colors hover:text-primary" title="Cancelar">
            <XCircle size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
