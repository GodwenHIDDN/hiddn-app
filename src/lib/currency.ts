export type SupportedCurrency = 'EUR' | 'GBP';

// Basic region detection for EU vs UK. Can extend with IP geo or explicit user setting.
export function detectCurrency(): SupportedCurrency {
  try {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get('cur');
    if (forced === 'GBP' || forced === 'EUR') return forced as SupportedCurrency;
  } catch {}
  try {
    const locale = navigator.language || 'en-GB';
    if (locale.includes('-GB') || locale.includes('-UK')) return 'GBP';
  } catch {}
  return 'EUR';
}
