import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { env } from '../config/env';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }
    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Socket connected: ${socket.id} (user ${socket.userId})`);

    socket.on('board:join', (boardId: string) => {
      socket.join(`board:${boardId}`);
    });

    socket.on('board:leave', (boardId: string) => {
      socket.leave(`board:${boardId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO server has not been initialized');
  }
  return io;
}

export function emitToBoard(boardId: string, event: string, payload: unknown): void {
  if (!io) return;
  io.to(`board:${boardId}`).emit(event, payload);
}
