import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Loader2,
  MapPin,
  Trash2,
} from 'lucide-react';
import { fetchAPI } from '../../services/api';

const DEFAULT_PAYMENT_OPTIONS = {
  defaultMethod: 'ON_SITE',
  onSiteEnabled: true,
  onlineEnabled: false,
};

function formatMoney(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function Cart() {
  const { complexId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const { cart = {}, products = [], complex: initialComplex = null } = state || {};
  const [complex, setComplex] = useState(initialComplex);
  const [localCart, setLocalCart] = useState(cart);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState('Pedido creado');
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_OPTIONS.defaultMethod);
  const [message, setMessage] = useState('');

  const cartItems = useMemo(() => products.filter((product) => localCart[product._id]), [localCart, products]);
  const total = cartItems.reduce((sum, product) => sum + product.price * (localCart[product._id] || 0), 0);
  const storePaymentOptions = complex?.storePaymentOptions || DEFAULT_PAYMENT_OPTIONS;

  useEffect(() => {
    let active = true;

    fetchAPI(`/complexes/${complexId}?clientVisible=true`)
      .then((complexData) => {
        if (!active) return;
        setComplex(complexData);
        const nextMethod =
          complexData?.storePaymentOptions?.onlineEnabled === true
            ? String(complexData.storePaymentOptions.defaultMethod || 'ONLINE').toUpperCase()
            : 'ON_SITE';
        setPaymentMethod(nextMethod === 'ONLINE' ? 'ONLINE' : 'ON_SITE');
      })
      .catch(() => {
        if (!active) return;
        setComplex(initialComplex);
      });

    return () => {
      active = false;
    };
  }, [complexId, initialComplex]);

  useEffect(() => {
    if (storePaymentOptions.onlineEnabled) {
      return;
    }

    setPaymentMethod('ON_SITE');
  }, [storePaymentOptions.onlineEnabled]);

  const remove = (id) =>
    setLocalCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const handleCheckout = async () => {
    setLoading(true);
    setMessage('');

    try {
      const items = cartItems.map((product) => ({
        productId: product._id,
        quantity: localCart[product._id],
      }));

      const response = await fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify({ complexId, items, paymentMethod }),
      });

      if (paymentMethod === 'ONLINE' && !response.paymentSession?.checkoutUrl) {
        throw new Error('No se pudo generar el checkout de Mercado Pago.');
      }

      if (response.paymentSession?.checkoutUrl) {
        window.location.assign(response.paymentSession.checkoutUrl);
        return;
      }

      setSuccessTitle('Pedido creado');
      setSuccess(true);
      setMessage(
        paymentMethod === 'ON_SITE'
          ? 'Tu pedido quedo registrado. Lo pagaras al retirar en el complejo.'
          : response.message || 'Redirigiendo a tus compras...',
      );
      setTimeout(() => navigate('/portal/mis-compras'), 2000);
    } catch (error) {
      setMessage(error.message || 'Error al preparar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <CheckCircle2 size={72} className="mb-6 text-green-500" />
        <h2 className="mb-2 font-display text-3xl font-bold text-on_surface">{successTitle}</h2>
        <p className="text-on_surface_variant">{message || 'Redirigiendo a tus compras...'}</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="py-32 text-center">
        <p className="mb-4 text-5xl text-on_surface_variant/40">Carrito vacio</p>
        <p className="text-lg text-on_surface_variant">No hay productos pendientes para cobrar.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-sm text-on_surface_variant transition-colors hover:text-on_surface"
      >
        <ChevronLeft size={16} />
        Seguir comprando
      </button>
      <h1 className="mb-8 font-display text-3xl font-bold text-on_surface">Tu carrito</h1>

      {message && (
        <div className="mb-6 rounded-2xl border border-outline_variant/20 bg-surface_container_low px-5 py-4 text-sm text-on_surface_variant">
          {message}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-primary/15 bg-primary/10 px-5 py-4">
        <p className="flex items-start gap-3 text-sm text-on_surface">
          <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
          Estos productos se retiran en el complejo donde los compraste. No se realizan envios ni delivery.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {storePaymentOptions.onSiteEnabled && (
            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-700">
              Pagar al retirar
            </span>
          )}
          {storePaymentOptions.onlineEnabled ? (
            <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-700">
              Pago online
            </span>
          ) : (
            <span className="text-xs text-on_surface_variant">
              El pago online todavia no esta habilitado en esta tienda.
            </span>
          )}
        </div>
      </div>

      <div className="mb-8 space-y-3">
        {cartItems.map((product) => (
          <div
            key={product._id}
            className="flex items-center justify-between rounded-2xl border border-outline_variant/20 bg-white px-5 py-4"
          >
            <div>
              <p className="text-sm font-medium text-on_surface">{product.name}</p>
              <p className="mt-0.5 text-xs text-on_surface_variant">
                x{localCart[product._id]} unidad{localCart[product._id] > 1 ? 'es' : ''}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-semibold text-primary">{formatMoney(product.price * localCart[product._id])}</p>
              <button
                onClick={() => remove(product._id)}
                className="text-outline transition-colors hover:text-error"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-outline_variant/20 bg-white p-6 shadow-[0_18px_38px_-26px_rgba(24,36,24,0.18)]">
        <div className="mb-5">
          <p className="mb-3 text-sm font-semibold text-on_surface">Como quieres pagar</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PaymentMethodCard
              icon={DollarSign}
              title="Pagar al retirar"
              description="Haces el pedido ahora y lo abonas cuando pases por el complejo."
              selected={paymentMethod === 'ON_SITE'}
              onClick={() => setPaymentMethod('ON_SITE')}
            />
            <PaymentMethodCard
              icon={CreditCard}
              title="Pagar online"
              description={
                storePaymentOptions.onlineEnabled
                  ? 'Te enviamos al checkout de Mercado Pago para dejar el pedido abonado.'
                  : 'Por ahora esta tienda no tiene cobro online activo.'
              }
              selected={paymentMethod === 'ONLINE'}
              disabled={!storePaymentOptions.onlineEnabled}
              onClick={() => setPaymentMethod('ONLINE')}
            />
          </div>
        </div>

        <div className="mb-5 flex justify-between text-base font-semibold text-on_surface">
          <span>Total</span>
          <span className="text-xl text-primary">{formatMoney(total)}</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary_container to-primary py-4 font-bold text-on_primary transition-all hover:brightness-110 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : null}
          {loading
            ? 'Procesando...'
            : paymentMethod === 'ONLINE'
              ? 'Comprar y pagar online'
              : 'Comprar y pagar al retirar'}
        </button>
      </div>
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
      className={`rounded-2xl border px-4 py-4 text-left transition-all ${
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
