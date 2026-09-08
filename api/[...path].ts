import type { Request, Response } from 'express';
import { app, appReady } from '../dist/index.js';

// The production build emits dist/index.js from server/index.ts. Vercel maps
// /api/* to this function while preserving the original request path.
export default async function handler(req: Request, res: Response) {
  await appReady;
  return app(req, res);
}
