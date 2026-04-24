function normalizeWhatsAppPhone(value = '') {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.startsWith('549')) {
    return digits;
  }

  if (digits.startsWith('54')) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `54${digits.slice(1)}`;
  }

  if (digits.length >= 10 && digits.length <= 11) {
    return `54${digits}`;
  }

  return digits;
}

export function buildWhatsAppUrl(phone = '', message = '') {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone) {
    return '';
  }

  const search = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${normalizedPhone}${search}`;
}
