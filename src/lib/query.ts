export function parsePositiveInt(
  value: unknown,
  fallback: number,
  max = 100
): number {
  if (typeof value !== "string") return fallback;
  const num = Number(value);
  return Number.isInteger(num) && num > 0 && num <= max ? num : fallback;
}

export function parseString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}