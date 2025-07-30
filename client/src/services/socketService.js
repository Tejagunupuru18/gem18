import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinRoom(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-room', userId);
    }
  }

  sendMessage(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send-message', data);
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  onUserJoinedCall(callback) {
    if (this.socket) {
      this.socket.on('user-joined-call', callback);
    }
  }

  onVideoOffer(callback) {
    if (this.socket) {
      this.socket.on('video-offer', callback);
    }
  }

  onVideoAnswer(callback) {
    if (this.socket) {
      this.socket.on('video-answer', callback);
    }
  }

  onIceCandidate(callback) {
    if (this.socket) {
      this.socket.on('ice-candidate', callback);
    }
  }

  joinVideoCall(sessionId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-video-call', sessionId);
    }
  }

  sendVideoOffer(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('video-offer', data);
    }
  }

  sendVideoAnswer(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('video-answer', data);
    }
  }

  sendIceCandidate(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('ice-candidate', data);
    }
  }
}

const socketService = new SocketService();
export default socketService; 