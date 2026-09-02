const sensitiveKey = /authorization|cookie|password|passcode|secret|token|credential|api[-_]?key|session|private[-_]?key|access[-_]?key/i;

export function sanitizeForLog(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[TRUNCATED]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return value.length > 1000 ? `${value.slice(0, 1000)}…` : value;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 100).map(item => sanitizeForLog(item, depth + 1));

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      sensitiveKey.test(key) ? "[REDACTED]" : sanitizeForLog(entry, depth + 1),
    ]),
  );
}
