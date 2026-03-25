import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  Save,
  Settings2,
  ShoppingBag,
  Ticket,
} from 'lucide-react';
import { fetchAPI } from '../services/api';

const INPUT_CLS =
  'w-full rounded-2xl border border-outline_variant/15 bg-surface_container px-4 py-3 text-sm text-on_surface placeholder-outline focus:outline-none focus:border-primary/40 transition-all';

const PAYMENT_STATUS_LABEL = {
  UNPAID: 'Sin cobrar',
  PARTIAL: 'Parcial',
  PAID: 'Pagada',
};

const ORDER_STATUS_LABEL = {
  pending: 'Pendiente',
  completed: 'Completada',
  failed: 'Fallida',
  cancelled: 'Cancelada',
};

function formatMoney(value, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
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

function MetricCard({ label, value, note, icon: Icon, tone = 'text-primary' }) {
  return (
    <div className="rounded-[1.5rem] border border-outline_variant/10 bg-surface_container p-5">
      <Icon size={18} className={`${tone} mb-2`} />
      <p className="text-xs uppercase tracking-wider text-outline mb-1">{label}</p>
      <p className="text-2xl font-display font-semibold text-on_surface">{value}</p>
      <p className="mt-2 text-sm text-on_surface_variant">{note}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-surface_container px-4 py-3">
      <p className="text-[0.65rem] uppercase tracking-widest text-outline mb-1">{label}</p>
      <p className="text-sm text-on_surface">{value || '-'}</p>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-outline_variant/10 bg-surface_container px-4 py-4 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-on_surface">{label}</p>
        <p className="text-xs text-on_surface_variant mt-1">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-primary"
      />
    </label>
  );
}

export default function OwnerCollections() {
  const [account, setAccount] = useState(null);
  const [complexes, setComplexes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    publicKey: '',
    accessToken: '',
    reservationsEnabled: true,
    ordersEnabled: true,
  });

  const loadData = async (mode = 'initial') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setErrorMessage('');

    try {
      const [paymentAccountResponse, reservationsResponse, ordersResponse] = await Promise.all([
        fetchAPI('/payment-account/current'),
        fetchAPI('/reservations'),
        fetchAPI('/orders'),
      ]);

      const nextAccount = paymentAccountResponse.account || null;
      setAccount(nextAccount);
      setComplexes(Array.isArray(paymentAccountResponse.complexes) ? paymentAccountResponse.complexes : []);
      setReservations(Array.isArray(reservationsResponse) ? reservationsResponse : []);
      setOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
      setForm({
        publicKey: nextAccount?.publicKey || '',
        accessToken: '',
        reservationsEnabled: nextAccount?.reservationsEnabled ?? true,
        ordersEnabled: nextAccount?.ordersEnabled ?? true,
      });
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo cargar el panel de cobros.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const paidReservations = reservations.filter((reservation) => reservation.paymentStatus === 'PAID');
    const completedOrders = orders.filter((order) => order.status === 'completed');

    return {
      reservationsRevenue: paidReservations.reduce(
        (sum, reservation) => sum + Number(reservation.totalPrice || 0),
        0,
      ),
      paidReservations: paidReservations.length,
      unpaidReservations: reservations.filter((reservation) => reservation.paymentStatus !== 'PAID').length,
      ordersRevenue: completedOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
      completedOrders: completedOrders.length,
      pendingOrders: orders.filter((order) => order.status === 'pending').length,
    };
  }, [orders, reservations]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setMessage('');

    try {
      const response = await fetchAPI('/payment-account/current', {
        method: 'PUT',
        body: JSON.stringify(form),
      });

      setAccount(response.account);
      setForm((prev) => ({
        ...prev,
        accessToken: '',
        publicKey: response.account?.publicKey || prev.publicKey,
        reservationsEnabled: response.account?.reservationsEnabled ?? prev.reservationsEnabled,
        ordersEnabled: response.account?.ordersEnabled ?? prev.ordersEnabled,
      }));
      setMessage(response.message || 'Cuenta de cobro actualizada.');
      await loadData('refresh');
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo guardar la cuenta de cobro.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={38} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm uppercase tracking-widest text-outline">Cobros del complejo</p>
          <h2 className="text-[2rem] sm:text-[2.5rem] font-display font-medium text-on_surface tracking-tight">
            Reservas y tienda
          </h2>
          <p className="max-w-3xl text-on_surface_variant">
            Desde aca conectas la cuenta de Mercado Pago donde vas a cobrar las reservas y las compras de productos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadData('refresh')}
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
          label="Cuenta conectada"
          value={account?.providerConfigured ? 'Activa' : 'Pendiente'}
          note={account?.collectorEmail || 'Conecta tu cuenta para cobrar online.'}
          icon={CreditCard}
          tone={account?.providerConfigured ? 'text-green-400' : 'text-yellow-400'}
        />
        <MetricCard
          label="Reservas cobradas"
          value={stats.paidReservations}
          note={formatMoney(stats.reservationsRevenue)}
          icon={Ticket}
          tone="text-primary"
        />
        <MetricCard
          label="Pedidos cobrados"
          value={stats.completedOrders}
          note={formatMoney(stats.ordersRevenue)}
          icon={ShoppingBag}
          tone="text-green-400"
        />
        <MetricCard
          label="Cobros pendientes"
          value={stats.unpaidReservations + stats.pendingOrders}
          note={`${stats.unpaidReservations} reservas y ${stats.pendingOrders} pedidos`}
          icon={CheckCircle2}
          tone="text-yellow-400"
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.75rem] border border-outline_variant/10 bg-surface_container_low p-6 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Settings2 size={18} />
            </div>
            <div>
              <h3 className="text-xl font-display font-medium text-on_surface">Cuenta Mercado Pago</h3>
              <p className="text-sm text-on_surface_variant">
                Esta cuenta va a recibir el dinero de reservas y productos de tu complejo.
              </p>
            </div>
          </div>

          {!account?.secureStorageReady && (
            <div className="mb-5 rounded-2xl border border-yellow-400/15 bg-yellow-400/5 px-4 py-4 text-sm text-yellow-400">
              Falta `PAYMENT_ACCOUNT_ENCRYPTION_SECRET` en el backend. Sin esa variable no se pueden guardar credenciales del owner.
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-outline">
                Public Key
              </label>
              <input
                type="text"
                value={form.publicKey}
                onChange={(event) => setForm((prev) => ({ ...prev, publicKey: event.target.value }))}
                placeholder="APP_USR-..."
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-outline">
                Access Token
              </label>
              <input
                type="password"
                value={form.accessToken}
                onChange={(event) => setForm((prev) => ({ ...prev, accessToken: event.target.value }))}
                placeholder={account?.accessTokenLastFour ? `Actual termina en ${account.accessTokenLastFour}` : 'APP_USR-...'}
                className={INPUT_CLS}
              />
              <p className="mt-2 text-xs text-outline">
                Si ya tenes una cuenta guardada, deja este campo vacio para conservar el token actual.
              </p>
            </div>

            <ToggleRow
              label="Cobrar reservas online"
              description="Si lo apagas, las reservas se siguen creando pero no se podran cobrar por Mercado Pago."
              checked={form.reservationsEnabled}
              onChange={(checked) => setForm((prev) => ({ ...prev, reservationsEnabled: checked }))}
            />

            <ToggleRow
              label="Cobrar tienda online"
              description="Si lo apagas, el carrito del ecommerce no abrira checkout."
              checked={form.ordersEnabled}
              onChange={(checked) => setForm((prev) => ({ ...prev, ordersEnabled: checked }))}
            />

            <button
              type="submit"
              disabled={saving || !account?.secureStorageReady}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary_container to-primary px-5 py-3.5 font-semibold text-on_primary_fixed transition-all hover:brightness-110 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Validando cuenta...' : 'Guardar cuenta de cobro'}
            </button>
          </form>
        </section>

        <section className="rounded-[1.75rem] border border-outline_variant/10 bg-surface_container_low p-6 sm:p-7">
          <h3 className="mb-5 text-xl font-display font-medium text-on_surface">Estado de la conexion</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MiniStat label="Estado" value={account?.status || 'DISCONNECTED'} />
            <MiniStat label="Modo" value={account?.mode || 'sandbox'} />
            <MiniStat label="Collector ID" value={account?.collectorId || 'Sin validar'} />
            <MiniStat label="Nickname" value={account?.collectorNickname || 'Sin validar'} />
            <MiniStat label="Email cobrador" value={account?.collectorEmail || 'Sin validar'} />
            <MiniStat label="Ultima validacion" value={formatDate(account?.lastValidatedAt)} />
          </div>

          <div className="mt-5 rounded-2xl border border-outline_variant/10 bg-surface_container p-4">
            <p className="text-xs uppercase tracking-widest text-outline mb-2">Complejos vinculados</p>
            <div className="flex flex-wrap gap-2">
              {complexes.length === 0 ? (
                <span className="text-sm text-on_surface_variant">No tenes complejos creados todavia.</span>
              ) : (
                complexes.map((complex) => (
                  <span
                    key={complex._id}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      complex.isActive ? 'bg-primary/10 text-primary' : 'bg-red-400/10 text-red-400'
                    }`}
                  >
                    {complex.name}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <section className="rounded-[1.75rem] border border-outline_variant/10 bg-surface_container_high p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-display font-medium text-on_surface">Cobros de reservas</h3>
              <p className="text-sm text-on_surface_variant">Historial de reservas y estado de cobro.</p>
            </div>
            <span className="text-xs uppercase tracking-widest text-outline">{reservations.length} reservas</span>
          </div>

          {reservations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline_variant/15 bg-surface_container_low px-5 py-8 text-center text-sm text-on_surface_variant">
              Todavia no hay reservas registradas.
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.slice(0, 8).map((reservation) => (
                <article key={reservation._id} className="rounded-2xl border border-outline_variant/10 bg-surface_container_low px-4 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-on_surface">{reservation.user?.displayName || 'Cliente'}</p>
                      <p className="text-sm text-outline">{reservation.complexId?.name || 'Complejo'} · {reservation.court?.name || 'Cancha'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
                      <MiniStat label="Pago" value={PAYMENT_STATUS_LABEL[reservation.paymentStatus] || reservation.paymentStatus} />
                      <MiniStat label="Monto" value={formatMoney(reservation.totalPrice)} />
                      <MiniStat label="Fecha" value={formatDate(reservation.date)} />
                      <MiniStat label="MP" value={reservation.mercadoPagoStatus || 'Sin intento'} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-outline_variant/10 bg-surface_container_high p-6 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-display font-medium text-on_surface">Cobros de tienda</h3>
              <p className="text-sm text-on_surface_variant">Pedidos del ecommerce y su estado de pago.</p>
            </div>
            <span className="text-xs uppercase tracking-widest text-outline">{orders.length} pedidos</span>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline_variant/15 bg-surface_container_low px-5 py-8 text-center text-sm text-on_surface_variant">
              Todavia no hay pedidos registrados.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 8).map((order) => (
                <article key={order._id} className="rounded-2xl border border-outline_variant/10 bg-surface_container_low px-4 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-on_surface">{order.userId?.displayName || 'Cliente'}</p>
                      <p className="text-sm text-outline">{order.complexId?.name || 'Complejo'} · {order.items?.length || 0} item(s)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
                      <MiniStat label="Estado" value={ORDER_STATUS_LABEL[order.status] || order.status} />
                      <MiniStat label="Monto" value={formatMoney(order.totalAmount)} />
                      <MiniStat label="Fecha" value={formatDate(order.createdAt)} />
                      <MiniStat label="MP" value={order.mercadoPagoStatus || 'Sin intento'} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
