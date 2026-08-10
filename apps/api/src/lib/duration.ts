const UNIT_MS: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
};

export function parseDurationMs(value: string | undefined, fallbackMs: number): number {
    if (!value) return fallbackMs;

    const match = /^(\d+)\s*(s|m|h|d)$/.exec(value.trim());
    if (!match) return fallbackMs;

    const [, amount, unit] = match;
    return Number(amount) * UNIT_MS[unit];
}
