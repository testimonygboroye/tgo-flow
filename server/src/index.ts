import http from 'http';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import boardRoutes from './routes/board.routes';
import { errorHandler } from './middleware/errorHandler';
import { initSocketServer } from './sockets';
import { generalApiLimiter } from './middleware/rateLimiter';

const app = express();
app.set('trust proxy', 1);
const httpServer = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(hpp());

if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.use('/api', generalApiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: env.nodeEnv });
});

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces/:workspaceId/boards', boardRoutes);

app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

app.use(errorHandler);

async function start() {
  await connectDB();
  initSocketServer(httpServer);
  const server = httpServer.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received: closing server gracefully`);
    server.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });

    // Force-exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
