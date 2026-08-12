const DEFAULT_SUFFIX_LENGTH = 8;

export function formatOrderId(id: string, suffixLength = DEFAULT_SUFFIX_LENGTH) {
  const length = Math.min(Math.max(suffixLength, 5), 10);
  return id.slice(-length);
}

export function formatOrderLabel(id: string, suffixLength = DEFAULT_SUFFIX_LENGTH) {
  return `Order #${formatOrderId(id, suffixLength)}`;
}
