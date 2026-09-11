let io;

// Configure Socket.IO handlers (receives already-created instance)
export const initSocket = (ioInstance) => {
  io = ioInstance;

  // Handle connection
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle authentication
    socket.on('authenticate', (authPayload) => {
      const userId =
        typeof authPayload === 'string'
          ? authPayload
          : authPayload?.userId;

      if (userId) {
        // Join a room specific to this user
        socket.join(`user:${userId}`);
        console.log(`User ${userId} authenticated and joined their room`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Get the Socket.IO instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Send notification to a specific user
export const sendNotificationToUser = (userId, notification) => {
  if (!io) {
    console.error('Socket.IO not initialized');
    return;
  }
  
  io.to(`user:${userId}`).emit('notification', notification);
};
