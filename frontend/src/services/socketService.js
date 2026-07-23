import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Remove /api from the end of the URL for Socket.IO connection
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      if (userId) {
        this.socket.emit('register', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    if (!this.socket) {
      console.warn('Socket is not connected. Call connect(userId) first.');
    }
    return this.socket;
  }
}

export default new SocketService();
