export function parsePositiveInt(value: unknown, fallback: number, max = 100): number {
    if (typeof value !== "string") return fallback;
    const num = Number(value);
    return Number.isInteger(num) && num > 0 && num <= max ? num : fallback;
}