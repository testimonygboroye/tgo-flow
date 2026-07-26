import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from '../config/env';
import authRoutes from '../routes/auth.routes';
import workspaceRoutes from '../routes/workspace.routes';
import boardRoutes from '../routes/board.routes';
import { errorHandler } from '../middleware/errorHandler';

export function buildTestApp() {
  const app = express();
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', authRoutes);
  app.use('/api/workspaces', workspaceRoutes);
  app.use('/api/workspaces/:workspaceId/boards', boardRoutes);
  app.use(errorHandler);
  return app;
}
