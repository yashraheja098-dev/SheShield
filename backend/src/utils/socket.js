import Message from "../models/Message.js";
import Location from "../models/Location.js";
const userSockets = new Map();

/**
 * Initializes Socket.IO connection event listeners.
 */
export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register active user connection
    socket.on("register", (userId) => {
      socket.userId = userId.toString();
      if (!userSockets.has(socket.userId)) {
        userSockets.set(socket.userId, new Set());
      }
      userSockets.get(socket.userId).add(socket.id);
      console.log(`User ${socket.userId} registered on socket: ${socket.id}`);
    });

    // Join unique journey room for live location sharing
    socket.on("join-journey", (journeyId) => {
      socket.join(journeyId.toString());
      console.log(`Socket ${socket.id} joined journey: ${journeyId}`);
    });

    // ── Safety Rooms Chat & Tracking ─────────────────────────────────────────
    socket.on("join-room", (roomId) => {
      socket.join(`room_${roomId}`);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on("leave-room", (roomId) => {
      socket.leave(`room_${roomId}`);
      console.log(`Socket ${socket.id} left room: ${roomId}`);
    });

    socket.on("send-message", async (data) => {
      try {
        // data expects: { roomId, messageId, senderId, senderName, message, timestamp }
        const { roomId, messageId, senderId, senderName, message, timestamp } = data;
        
        // Save to DB
        const newMessage = new Message({
          messageId,
          roomId,
          senderId,
          senderName,
          message,
          createdAt: timestamp || Date.now()
        });
        await newMessage.save();

        // Broadcast to room
        io.to(`room_${roomId}`).emit("receive-message", data);
      } catch (error) {
        console.error("Error saving message via socket:", error);
      }
    });

    socket.on("typing", (data) => {
      // data: { roomId, senderName }
      socket.to(`room_${data.roomId}`).emit("typing", data);
    });

    socket.on("stop-typing", (data) => {
      // data: { roomId, senderName }
      socket.to(`room_${data.roomId}`).emit("stop-typing", data);
    });

    socket.on("update-location", async (data) => {
      try {
        // data expects: { roomId, userId, latitude, longitude, timestamp }
        const { roomId, userId, latitude, longitude, timestamp } = data;
        
        // Save to DB
        const newLocation = new Location({
          roomId,
          userId,
          latitude,
          longitude,
          timestamp: timestamp || Date.now()
        });
        await newLocation.save();

        // Broadcast to room
        io.to(`room_${roomId}`).emit("receive-location", data);
      } catch (error) {
        console.error("Error saving location via socket:", error);
      }
    });
    // ─────────────────────────────────────────────────────────────────────────

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId && userSockets.has(socket.userId)) {
        const sockets = userSockets.get(socket.userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(socket.userId);
        }
      }
    });
  });
};

/**
 * Emits a WebSocket event to all active sockets of a specific user.
 */
export const emitToUser = (io, userId, event, data) => {
  if (!io) return;
  const userStr = userId.toString();
  if (userSockets.has(userStr)) {
    const sockets = userSockets.get(userStr);
    sockets.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
};

/**
 * Emits a WebSocket event to a shared journey room (all tracking listeners).
 */
export const emitToJourney = (io, journeyId, event, data) => {
  if (!io) return;
  io.to(journeyId.toString()).emit(event, data);
};
