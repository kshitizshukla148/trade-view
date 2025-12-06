import { io } from 'socket.io-client';

// Vite uses import.meta.env instead of process.env
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToStocks = (callback) => {
  const socket = connectSocket();
  socket.emit('subscribe-stocks', []);
  socket.on('stock-prices-updated', callback);
  return () => {
    socket.off('stock-prices-updated', callback);
  };
};

export const subscribeToPortfolio = (callback) => {
  const socket = connectSocket();
  socket.on('portfolio-updated', callback);
  return () => {
    socket.off('portfolio-updated', callback);
  };
};

export default socket;

