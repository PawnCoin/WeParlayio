import type { Request, Response } from 'express';
import { app, appReady } from '../server/index';

// Vercel maps /api/* to this function. The Express app keeps the original
// request path, so its existing API routes work unchanged.
export default async function handler(req: Request, res: Response) {
  await appReady;
  return app(req, res);
}
