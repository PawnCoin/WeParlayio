import type { Request, Response } from 'express';

// Temporary deployment diagnostic. It intentionally never exposes secret values.
export default function handler(_req: Request, res: Response) {
  res.status(200).json({
    service: 'weparlay',
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    sessionSecretConfigured: Boolean(process.env.SESSION_SECRET),
    launchMode: process.env.WEPARLAY_LAUNCH_MODE ?? null,
  });
}
