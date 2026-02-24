type LogLevel = "info" | "warn" | "error";

const SENSITIVE_KEYS = [
  "password",
  "token",
  "authorization",
  "cookie",
  "email",
  "phone",
  "name",
  "address",
  "ip",
  "session",
  "creditcard",
  "card",
  "cpf",
  "ssn",
];

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitiveKey) => normalized.includes(sensitiveKey));
}

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: process.env.NODE_ENV === "development" ? value.stack : undefined,
    };
  }

  if (typeof value === "object") {
    const sanitizedObject: Record<string, unknown> = {};

    Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
      if (isSensitiveKey(key)) {
        sanitizedObject[key] = "[REDACTED]";
        return;
      }

      sanitizedObject[key] = sanitizeValue(nestedValue);
    });

    return sanitizedObject;
  }

  return value;
}

export function logServerEvent(level: LogLevel, event: string, context: Record<string, unknown> = {}): void {
  const basePayload = {
    event,
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    context: sanitizeValue(context),
  };

  if (process.env.NODE_ENV === "production") {
    const productionPayload = {
      event: basePayload.event,
      env: basePayload.env,
      timestamp: basePayload.timestamp,
      context: basePayload.context,
    };

    if (level === "error") {
      console.error("[ServerLog]", productionPayload);
      return;
    }

    if (level === "warn") {
      console.warn("[ServerLog]", productionPayload);
      return;
    }

    console.info("[ServerLog]", productionPayload);
    return;
  }

  const detailedPayload = {
    ...basePayload,
    pid: process.pid,
    nodeVersion: process.version,
  };

  if (level === "error") {
    console.error("[ServerLog]", detailedPayload);
    return;
  }

  if (level === "warn") {
    console.warn("[ServerLog]", detailedPayload);
    return;
  }

  console.info("[ServerLog]", detailedPayload);
}
