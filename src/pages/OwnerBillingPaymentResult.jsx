import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock3, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAPI } from '../services/api';

function resolveVisualState(resultHint, payload) {
  const invoiceStatus = String(payload?.invoice?.status || '').toUpperCase();

  if (invoiceStatus === 'PAID') {
    return {
      tone: 'success',
      title: 'Pago acreditado',
      description: 'La mensualidad se acredito correctamente y tu acceso quedo actualizado.',
    };
  }

  if (['FAILED', 'CANCELLED'].includes(invoiceStatus) || resultHint === 'failure') {
    return {
      tone: 'failure',
      title: 'Pago no acreditado',
      description: 'Mercado Pago no confirmo la mensualidad. Puedes volver a facturacion y reintentar.',
    };
  }

  return {
    tone: 'pending',
    title: 'Pago pendiente',
    description: 'La mensualidad sigue pendiente hasta que Mercado Pago confirme la acreditacion.',
  };
}

export default function OwnerBillingPaymentResult() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [payload, setPayload] = useState(null);

  const invoiceId = searchParams.get('invoiceId') || searchParams.get('id') || '';
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || '';
  const resultHint = (searchParams.get('result') || searchParams.get('status') || searchParams.get('collection_status') || 'pending').toLowerCase();

  const visualState = useMemo(() => resolveVisualState(resultHint, payload), [payload, resultHint]);

  useEffect(() => {
    let active = true;

    const syncPayment = async () => {
      if (!invoiceId) {
        if (!active) return;
        setErrorMessage('No se recibio informacion suficiente para validar la mensualidad.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetchAPI(`/owner-billing/invoices/${invoiceId}/sync-payment`, {
          method: 'POST',
          body: JSON.stringify({
            paymentId,
            result: resultHint,
          }),
        });

        if (!active) return;

        setPayload(response);
        await refreshProfile().catch(() => {});
      } catch (error) {
        if (!active) return;
        setErrorMessage(error.message || 'No se pudo validar el pago de la mensualidad.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    syncPayment();

    return () => {
      active = false;
    };
  }, [invoiceId, paymentId, refreshProfile, resultHint]);

  useEffect(() => {
    if (loading || errorMessage || visualState.tone === 'failure') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      navigate('/dashboard/billing', { replace: true });
    }, visualState.tone === 'success' ? 2200 : 2800);

    return () => window.clearTimeout(timeoutId);
  }, [errorMessage, loading, navigate, visualState.tone]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <Loader2 size={42} className="animate-spin text-primary" />
        <h1 className="mt-6 text-3xl font-display font-bold text-on_surface">Validando pago</h1>
        <p className="mt-2 text-on_surface_variant">Estamos consultando a Mercado Pago para confirmar la mensualidad.</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-primary/20 bg-white p-8 text-center shadow-[0_24px_60px_-34px_rgb(var(--bg-main-rgb)/0.14)]">
        <AlertCircle size={52} className="mx-auto text-red-500" />
        <h1 className="mt-5 text-3xl font-display font-bold text-on_surface">No se pudo validar el pago</h1>
        <p className="mt-3 text-on_surface_variant">{errorMessage}</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/billing', { replace: true })}
          className="mt-8 rounded-2xl bg-primary px-6 py-3 font-semibold text-on_primary"
        >
          Volver a facturacion
        </button>
      </div>
    );
  }

  const Icon =
    visualState.tone === 'success'
      ? CheckCircle2
      : visualState.tone === 'pending'
        ? Clock3
        : AlertCircle;

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-outline_variant/20 bg-white p-8 text-center shadow-[0_24px_60px_-34px_rgb(var(--bg-main-rgb)/0.14)]">
      <Icon
        size={56}
        className={`mx-auto ${
          visualState.tone === 'success'
            ? 'text-primary'
            : visualState.tone === 'pending'
              ? 'text-yellow-500'
              : 'text-red-500'
        }`}
      />
      <h1 className="mt-5 text-3xl font-display font-bold text-on_surface">{visualState.title}</h1>
      <p className="mt-3 text-on_surface_variant">{visualState.description}</p>
      <button
        type="button"
        onClick={() => navigate('/dashboard/billing', { replace: true })}
        className="mt-8 rounded-2xl bg-primary px-6 py-3 font-semibold text-on_primary"
      >
        Continuar
      </button>
    </div>
  );
}
