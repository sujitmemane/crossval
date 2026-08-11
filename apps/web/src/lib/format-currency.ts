const FALLBACK_CURRENCY = 'USD';

export function formatCurrency(value: number, currency = FALLBACK_CURRENCY, compact = false) {
  const code = currency.toUpperCase();

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...(compact && Math.abs(value) >= 100_000
        ? { notation: 'compact' as const, maximumFractionDigits: 1 }
        : {}),
    }).format(value);
  } catch {
    return `${code} ${value.toFixed(2)}`;
  }
}

export function formatCount(value: number) {
  return new Intl.NumberFormat(undefined).format(value);
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}
