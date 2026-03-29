const PAYMENT_METHOD_META = {
  ON_SITE: {
    label: 'Paga al retirar',
    shortLabel: 'Al retirar',
    cls: 'bg-amber-400/10 text-amber-700',
  },
  ONLINE: {
    label: 'Pago online',
    shortLabel: 'Online',
    cls: 'bg-sky-400/10 text-sky-700',
  },
};

export function resolveOrderPaymentMethod(order = {}) {
  const normalized = String(order?.paymentMethod || '')
    .trim()
    .toUpperCase();

  if (normalized === 'ONLINE' || normalized === 'ON_SITE') {
    return normalized;
  }

  if (
    order?.mercadoPagoPreferenceId ||
    order?.mercadoPagoOrderId ||
    order?.mercadoPagoPaymentId ||
    order?.mercadoPagoStatus ||
    order?.mercadoPagoPaymentMethodId
  ) {
    return 'ONLINE';
  }

  return 'ON_SITE';
}

export function getOrderPaymentMethodMeta(order = {}) {
  return PAYMENT_METHOD_META[resolveOrderPaymentMethod(order)] || PAYMENT_METHOD_META.ON_SITE;
}

