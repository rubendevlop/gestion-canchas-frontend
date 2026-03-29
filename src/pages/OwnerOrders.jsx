import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  CalendarRange,
  CheckCircle2,
  CircleOff,
  Clock3,
  CreditCard,
  DollarSign,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Store,
  User,
  X,
} from 'lucide-react';
import { fetchAPI } from '../services/api';
import { getOrderPaymentMethodMeta, resolveOrderPaymentMethod } from '../utils/orderPayments';

const STATUS_META = {
  pending: {
    label: 'Pendiente',
    badge: 'bg-amber-400/10 text-amber-700',
  },
  completed: {
    label: 'Cobrado',
    badge: 'bg-green-400/10 text-green-700',
  },
  cancelled: {
    label: 'Cancelado',
    badge: 'bg-red-400/10 text-red-600',
  },
  failed: {
    label: 'Fallido',
    badge: 'bg-red-400/10 text-red-600',
  },
};

const OWNER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente de cobro' },
  { value: 'completed', label: 'Cobrado / completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const SELECT_CLS =
  'w-full rounded-2xl border border-outline_variant/15 bg-surface_container px-4 py-3 text-sm text-on_surface focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15';

function formatMoney(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return 'Sin registro';
  return new Date(value).toLocaleString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function MetricCard({ label, value, note, icon: Icon, tone = 'text-primary' }) {
  return (
    <div className="rounded-[1.5rem] border border-outline_variant/10 bg-surface_container p-5">
      <Icon size={18} className={`${tone} mb-2`} />
      <p className="mb-1 text-xs uppercase tracking-wider text-outline">{label}</p>
      <p className="font-display text-2xl font-semibold text-on_surface">{value}</p>
      <p className="mt-2 text-sm text-on_surface_variant">{note}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-surface_container px-4 py-3">
      <p className="mb-1 text-[0.65rem] uppercase tracking-widest text-outline">{label}</p>
      <p className="text-sm text-on_surface">{value || '-'}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-5 shrink-0 justify-center text-outline">{icon}</span>
      <span className="w-24 shrink-0 text-sm text-outline">{label}</span>
      <span className="text-sm font-medium text-on_surface">{value}</span>
    </div>
  );
}

function EmptyState({ searchActive = false }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-outline_variant/15 bg-surface_container_low px-6 py-12 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <ShoppingBag size={28} />
      </div>
      <h3 className="text-2xl font-display font-medium text-on_surface">
        {searchActive ? 'No hay pedidos con esos filtros' : 'Todavia no hay pedidos registrados'}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-on_surface_variant">
        {searchActive
          ? 'Ajusta la busqueda o cambia los filtros para ver otros pedidos.'
          : 'Cuando un cliente compre productos en la tienda, apareceran aqui para que puedas gestionarlos.'}
      </p>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border border-outline_variant/15 bg-surface_container_low p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 className="text-xl font-display font-semibold text-on_surface">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-outline transition-colors hover:bg-surface_container hover:text-on_surface"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function OrderCard({ order, onOpen }) {
  const statusMeta = STATUS_META[String(order.status || '').toLowerCase()] || STATUS_META.pending;
  const paymentMethodMeta = getOrderPaymentMethodMeta(order);
  const itemCount = Array.isArray(order.items) ? order.items.length : 0;

  return (
    <button
      type="button"
      onClick={() => onOpen(order)}
      className="w-full rounded-[1.5rem] border border-outline_variant/10 bg-surface_container_low px-5 py-5 text-left transition-colors hover:bg-surface_container"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badge}`}>
              {statusMeta.label}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentMethodMeta.cls}`}>
              {paymentMethodMeta.shortLabel}
            </span>
            <span className="rounded-full bg-surface_container px-3 py-1 text-xs font-semibold uppercase tracking-wider text-on_surface_variant">
              Pedido #{String(order._id).slice(-6).toUpperCase()}
            </span>
          </div>

          <p className="font-medium text-on_surface">{order.userId?.displayName || 'Cliente'}</p>
          <p className="mt-1 text-sm text-outline">
            {order.complexId?.name || 'Complejo'} · {itemCount} item(s)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
          <MiniStat label="Monto" value={formatMoney(order.totalAmount)} />
          <MiniStat label="Creado" value={formatDate(order.createdAt)} />
          <MiniStat label="Pagado" value={formatDate(order.paidAt)} />
          <MiniStat label="Retiro" value={order.complexId?.name || 'Complejo'} />
        </div>
      </div>
    </button>
  );
}

function OrderDetailModal({ order, saving, onClose, onSave }) {
  const paymentMethod = resolveOrderPaymentMethod(order);
  const paymentMethodMeta = getOrderPaymentMethodMeta(order);
  const statusMeta = STATUS_META[String(order.status || '').toLowerCase()] || STATUS_META.pending;
  const isOnSite = paymentMethod === 'ON_SITE';
  const [draftStatus, setDraftStatus] = useState('pending');

  useEffect(() => {
    setDraftStatus(
      OWNER_STATUS_OPTIONS.some((option) => option.value === order.status) ? order.status : 'pending',
    );
  }, [order]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(order._id, draftStatus);
  };

  return (
    <Modal title={`Pedido #${String(order._id).slice(-6).toUpperCase()}`} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusMeta.badge}`}>
            {statusMeta.label}
          </span>
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${paymentMethodMeta.cls}`}>
            {paymentMethodMeta.label}
          </span>
        </div>

        <div className="space-y-3 rounded-[1.5rem] bg-surface_container p-4">
          <InfoRow icon={<User size={15} />} label="Cliente" value={order.userId?.displayName || 'Cliente'} />
          <InfoRow icon={<User size={15} />} label="Email" value={order.userId?.email || 'Sin email'} />
          <InfoRow icon={<Store size={15} />} label="Complejo" value={order.complexId?.name || 'No disponible'} />
          <InfoRow icon={<MapPin size={15} />} label="Retiro" value={order.complexId?.name || 'En el complejo'} />
          <InfoRow icon={<CalendarRange size={15} />} label="Creado" value={formatDateTime(order.createdAt)} />
          <InfoRow icon={<DollarSign size={15} />} label="Total" value={formatMoney(order.totalAmount)} />
          <InfoRow icon={<CreditCard size={15} />} label="Cobro" value={paymentMethodMeta.label} />
          <InfoRow icon={<CheckCircle2 size={15} />} label="Pagado" value={formatDateTime(order.paidAt)} />
          <InfoRow
            icon={<CreditCard size={15} />}
            label="Estado MP"
            value={order.mercadoPagoStatus || order.mercadoPagoOrderStatus || 'Sin intento'}
          />
        </div>

        <section className="rounded-[1.5rem] border border-outline_variant/10 bg-surface_container_low p-4">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-outline">Productos</h4>
          <div className="space-y-3">
            {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
              <div
                key={`${item.productId?._id || item.productId || index}`}
                className="flex flex-col gap-3 rounded-2xl border border-outline_variant/10 bg-surface_container px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Package size={17} />
                  </div>
                  <div>
                    <p className="font-medium text-on_surface">{item.productId?.name || 'Producto'}</p>
                    <p className="text-sm text-on_surface_variant">
                      Cantidad: {Number(item.quantity || 1)}
                    </p>
                  </div>
                </div>

                <div className="text-sm font-semibold text-on_surface">
                  {formatMoney(Number(item.price || 0) * Number(item.quantity || 1))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {isOnSite ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.5rem] border border-outline_variant/10 bg-surface_container_low p-4"
          >
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-outline">
              Estado del pedido
            </label>
            <select
              value={draftStatus}
              onChange={(event) => setDraftStatus(event.target.value)}
              className={SELECT_CLS}
              disabled={saving}
            >
              {OWNER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-3 text-sm text-on_surface_variant">
              Para pedidos al retirar puedes marcar si quedaron cobrados, volverlos a pendiente o cancelarlos.
            </p>

            <button
              type="submit"
              disabled={saving || draftStatus === order.status}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary_container to-primary px-5 py-3.5 font-semibold text-on_primary transition-all hover:brightness-110 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        ) : (
          <div className="rounded-[1.5rem] border border-sky-400/15 bg-sky-400/5 px-4 py-4 text-sm text-sky-700">
            Este pedido usa pago online. Su estado de cobro se actualiza automaticamente desde Mercado Pago y aqui queda solo para seguimiento.
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function OwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const deferredSearch = useDeferredValue(search);

  const loadOrders = async (mode = 'initial') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await fetchAPI('/orders');
      setOrders(Array.isArray(response) ? response : []);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'No se pudieron cargar los pedidos.');
      if (mode === 'initial') {
        setOrders([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === 'pending');
    const completed = orders.filter((order) => order.status === 'completed');
    const cancelled = orders.filter((order) => order.status === 'cancelled');

    return {
      total: orders.length,
      pending: pending.length,
      completed: completed.length,
      cancelled: cancelled.length,
      revenue: completed.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = String(deferredSearch || '').trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'ALL' || String(order.status || '').toLowerCase() === statusFilter.toLowerCase();
      const matchesPayment =
        paymentFilter === 'ALL' || resolveOrderPaymentMethod(order) === paymentFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        String(order._id || '').toLowerCase().includes(normalizedSearch) ||
        String(order.userId?.displayName || '').toLowerCase().includes(normalizedSearch) ||
        String(order.userId?.email || '').toLowerCase().includes(normalizedSearch) ||
        String(order.complexId?.name || '').toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesPayment && matchesSearch;
    });
  }, [deferredSearch, orders, paymentFilter, statusFilter]);

  const handleSaveStatus = async (orderId, status) => {
    setSaving(true);
    setMessage('');
    setErrorMessage('');

    try {
      const response = await fetchAPI(`/orders/${orderId}/owner-status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      setOrders((current) =>
        current.map((order) => (order._id === response.order?._id ? response.order : order)),
      );
      setSelectedOrder(response.order || null);
      setMessage(response.message || 'Pedido actualizado.');
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo actualizar el pedido.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm uppercase tracking-widest text-outline">Gestion de tienda</p>
          <h2 className="font-display text-[2rem] font-medium tracking-tight text-on_surface sm:text-[2.5rem]">
            Pedidos
          </h2>
          <p className="max-w-3xl text-on_surface_variant">
            Revisa pedidos de productos y actualiza manualmente los cobros al retirar sin mezclarlos con la configuracion de Mercado Pago.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadOrders('refresh')}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-outline_variant/15 bg-surface_container px-4 py-3 text-sm text-on_surface_variant transition-colors hover:bg-surface_container_highest hover:text-on_surface disabled:opacity-50"
        >
          {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </header>

      {message && (
        <div className="mb-6 rounded-[1.5rem] border border-green-400/15 bg-green-400/5 px-5 py-4 text-sm text-green-400">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-[1.5rem] border border-red-400/15 bg-red-400/5 px-5 py-4 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Pedidos totales"
          value={stats.total}
          note="Compras registradas en tu tienda."
          icon={ShoppingBag}
          tone="text-primary"
        />
        <MetricCard
          label="Pendientes"
          value={stats.pending}
          note="Esperando cobro o resolucion."
          icon={Clock3}
          tone="text-yellow-400"
        />
        <MetricCard
          label="Cobrados"
          value={stats.completed}
          note={formatMoney(stats.revenue)}
          icon={CheckCircle2}
          tone="text-green-400"
        />
        <MetricCard
          label="Cancelados"
          value={stats.cancelled}
          note="Pedidos anulados manualmente."
          icon={CircleOff}
          tone="text-red-400"
        />
      </div>

      <div className="mb-8 rounded-[1.5rem] border border-primary/15 bg-primary/10 px-5 py-4">
        <p className="flex items-start gap-3 text-sm text-on_surface">
          <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
          Los pedidos de tienda siempre se retiran en el complejo. Si el cliente eligio pagar al retirar, aqui puedes marcar cuando efectivamente se cobro.
        </p>
      </div>

      <section className="mb-6 rounded-[1.75rem] border border-outline_variant/10 bg-surface_container_low p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <label className="relative block">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por cliente, email, complejo o ID"
              className="w-full rounded-2xl border border-outline_variant/15 bg-surface_container py-3 pl-11 pr-4 text-sm text-on_surface placeholder:text-outline focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={SELECT_CLS}
          >
            <option value="ALL">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Cobrados</option>
            <option value="cancelled">Cancelados</option>
            <option value="failed">Fallidos</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
            className={SELECT_CLS}
          >
            <option value="ALL">Todos los cobros</option>
            <option value="ON_SITE">Paga al retirar</option>
            <option value="ONLINE">Pago online</option>
          </select>
        </div>
      </section>

      {filteredOrders.length === 0 ? (
        <EmptyState searchActive={search.trim().length > 0 || statusFilter !== 'ALL' || paymentFilter !== 'ALL'} />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} onOpen={setSelectedOrder} />
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          saving={saving}
          onClose={() => setSelectedOrder(null)}
          onSave={handleSaveStatus}
        />
      )}
    </div>
  );
}
