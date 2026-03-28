const PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';

let initializedPublicKey = '';
let sdkLoader = null;

export function getMercadoPagoPublicKey(overrideKey = '') {
  return overrideKey || PUBLIC_KEY;
}

export function isMercadoPagoConfigured(overrideKey = '') {
  return Boolean(getMercadoPagoPublicKey(overrideKey));
}

export function loadMercadoPagoSdk() {
  if (!sdkLoader) {
    sdkLoader = import('@mercadopago/sdk-react');
  }

  return sdkLoader;
}

export async function ensureMercadoPago(overrideKey = '') {
  const publicKey = getMercadoPagoPublicKey(overrideKey);

  if (!publicKey) {
    return publicKey;
  }

  if (initializedPublicKey === publicKey) {
    return publicKey;
  }

  const { initMercadoPago } = await loadMercadoPagoSdk();
  initMercadoPago(publicKey, {
    locale: 'es-AR',
  });

  initializedPublicKey = publicKey;
  return publicKey;
}
