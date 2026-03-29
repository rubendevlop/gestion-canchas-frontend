const PAYMENT_METHOD_META = {
  ON_SITE: {
    label: 'Paga en cancha',
    shortLabel: 'En cancha',
    cls: 'bg-amber-400/10 text-amber-700',
  },
  ONLINE: {
    label: 'Pago online',
    shortLabel: 'Online',
    cls: 'bg-sky-400/10 text-sky-700',
  },
};

export function resolveReservationPaymentMethod(reservation = {}) {
  const normalized = String(reservation?.paymentMethod || '')
    .trim()
    .toUpperCase();

  if (normalized === 'ONLINE' || normalized === 'ON_SITE') {
    return normalized;
  }

  if (
    reservation?.mercadoPagoPreferenceId ||
    reservation?.mercadoPagoOrderId ||
    reservation?.mercadoPagoPaymentId ||
    reservation?.mercadoPagoStatus ||
    reservation?.mercadoPagoPaymentMethodId
  ) {
    return 'ONLINE';
  }

  return 'ON_SITE';
}

export function getReservationPaymentMethodMeta(reservation = {}) {
  return PAYMENT_METHOD_META[resolveReservationPaymentMethod(reservation)] || PAYMENT_METHOD_META.ON_SITE;
}

