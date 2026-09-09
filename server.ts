import type { Request, Response } from 'express';
import { app, appReady } from './server/index';

// Vercel's Express entrypoint. Local and Replit startup continue to use
// server/index.ts, while Vercel waits for route initialization per function.
export default async function handler(req: Request, res: Response) {
  await appReady;
  return app(req, res);
}
