import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;
  socket = io('http://localhost:4000', {
    auth: { token },
    autoConnect: true,
  });
  return socket;
};

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = (): Socket | null => socket;
