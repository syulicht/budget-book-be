import type { CorsOptions } from "cors";

const parseAllowedOrigins = (): string[] => {
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS ?? "";

  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = parseAllowedOrigins();
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS origin is not allowed: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
