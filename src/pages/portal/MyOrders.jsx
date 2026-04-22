import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Loader2, MapPin, Package, ShoppingBag, Store } from 'lucide-react';
import AppModal from '../../components/AppModal';
import { fetchAPI } from '../../services/api';
import {
  getOrderPaymentMethodMeta,
  resolveOrderPaymentMethod,
} from '../../utils/orderPayments';

const STATUS_STYLES = {
  completed: { label: 'Pagado', cls: 'bg-green-400/10 text-green-600' },
  pending: { label: 'Pendiente', cls: 'bg-yellow-400/10 text-yellow-700' },
  cancelled: { label: 'Cancelado', cls: 'bg-red-400/10 text-red-600' },
  failed: { label: 'Fallido', cls: 'bg-red-400/10 text-red-600' },
};

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('es-AR')}`;
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState('');
  const [dialogModal, setDialogModal] = useState(null);

  useEffect(() => {
    fetchAPI('/orders')
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handlePayOnline = async (orderId) => {
    setPayingOrderId(orderId);

    try {
      const response = await fetchAPI(`/orders/${orderId}/pay`, { method: 'POST' });
      if (!response.paymentSession?.checkoutUrl) {
        throw new Error('No se pudo generar el checkout de Mercado Pago.');
      }

      window.location.assign(response.paymentSession.checkoutUrl);
    } catch (error) {
      setDialogModal({
        title: 'No se pudo iniciar el pago online',
        description: error.message || 'No se pudo iniciar el pago online del pedido.',
        tone: 'error',
      });
    } finally {
      setPayingOrderId('');
    }
  };

  const { completedOrders, otherOrders } = useMemo(
    () => ({
      completedOrders: orders.filter((order) => order.status === 'completed'),
      otherOrders: orders.filter((order) => order.status !== 'completed'),
    }),
    [orders],
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
        <div className="app-shell-empty py-24">
        <ShoppingBag size={56} className="mx-auto mb-4 text-brand_gray/35" strokeWidth={1} />
        <p className="mb-6 text-brand_gray">Todavia no tienes compras registradas.</p>
        <Link
          to="/portal"
          className="app-shell-button-primary px-6 py-3 text-sm"
        >
          Ir a los complejos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Mis compras</h1>
        <p className="mt-2 text-brand_gray">
          Revisa que compraste, en que complejo y como quedo cada pedido.
        </p>
      </header>

      <div className="mb-8 rounded-2xl border border-primary/15 bg-primary/10 px-5 py-4">
        <p className="flex items-start gap-3 text-sm text-white">
          <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
          Recuerda que cada compra se retira en el complejo donde fue realizada. La app no gestiona entregas a domicilio.
        </p>
      </div>

      <div className="space-y-10">
        {completedOrders.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand_gray">
              Compras confirmadas
            </h2>
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            </section>
        )}

        {otherOrders.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand_gray">
              Otros pedidos
            </h2>
              <div className="space-y-4">
                {otherOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onPayOnline={handlePayOnline}
                    paying={payingOrderId === order._id}
                  />
                ))}
              </div>
            </section>
        )}
      </div>

      <AppModal
        open={Boolean(dialogModal)}
        title={dialogModal?.title || ''}
        description={dialogModal?.description || ''}
        tone={dialogModal?.tone || 'error'}
        onClose={() => setDialogModal(null)}
      />
    </div>
  );
}

function OrderCard({ order, onPayOnline, paying = false }) {
  const status = STATUS_STYLES[String(order.status || '').toLowerCase()] || STATUS_STYLES.pending;
  const paymentMethodMeta = getOrderPaymentMethodMeta(order);
  const complex = order.complexId;
  const items = Array.isArray(order.items) ? order.items : [];
  const canPayOnline =
    String(order.status || '').toLowerCase() === 'pending' &&
    resolveOrderPaymentMethod(order) === 'ONLINE';

  return (
    <article className="app-shell-panel p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${status.cls}`}>
              {status.label}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentMethodMeta.cls}`}>
              {paymentMethodMeta.shortLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand_gray">
              Pedido #{String(order._id).slice(-6).toUpperCase()}
            </span>
          </div>

          <h2 className="text-xl font-display font-semibold text-white">
            {complex?.name || 'Complejo'}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-brand_gray">
            <Store size={14} />
            Comprado en {complex?.name || 'un complejo'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm sm:min-w-[240px]">
          <Metric label="Total" value={formatMoney(order.totalAmount)} strong />
          <Metric label="Creado" value={formatDate(order.createdAt)} />
          <Metric label="Pagado" value={formatDate(order.paidAt)} />
          <Metric label="Cobro" value={paymentMethodMeta.shortLabel} />
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item.productId?._id || item.productId || index}`}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Package size={18} />
              </div>
              <div>
                <p className="font-medium text-white">
                  {item.productId?.name || 'Producto'}
                </p>
                <p className="text-sm text-brand_gray">
                  Cantidad: {Number(item.quantity || 1)}
                </p>
              </div>
            </div>

            <div className="text-sm font-semibold text-white">
              {formatMoney(Number(item.price || 0) * Number(item.quantity || 1))}
            </div>
          </div>
        ))}
      </div>

      {complex?._id && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-brand_gray">
            Entrega y retiro en <span className="font-semibold text-white">{complex?.name || 'el complejo'}</span>.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {canPayOnline && onPayOnline && (
              <button
                type="button"
                onClick={() => onPayOnline(order._id)}
                disabled={paying}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/12 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/18 disabled:opacity-60"
              >
                {paying ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                {paying ? 'Procesando...' : 'Pagar online'}
              </button>
            )}
            <Link
              to={`/portal/complejo/${complex._id}/tienda`}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
            >
              <ShoppingBag size={16} />
              Volver a esta tienda
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}

function Metric({ label, value, strong = false }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-brand_gray/70">{label}</p>
      <p className={`mt-1 ${strong ? 'font-semibold text-white' : 'text-brand_gray'}`}>
        {value}
      </p>
    </div>
  );
}
