import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Message from "../model/Message.js";
import User from "../model/user.model.js"; 

const app = express();
const server = http.createServer(app);

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

io.on("connection", async (socket) => {
  console.log("A user connected", socket.user.fullname);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // mark messages as delivered on connect
  try {
    const undeliveredMessages = await Message.find({
      receiverId: userId,
      status: "sent",
    });

    if (undeliveredMessages.length > 0) {
      await Message.updateMany(
        { receiverId: userId, status: "sent" },
        { status: "delivered" }
      );

      const senderIds = [
        ...new Set(undeliveredMessages.map((m) => m.senderId.toString())),
      ];

      senderIds.forEach((senderId) => {
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesDelivered", {
            receiverId: userId,
          });
        }
      });
    }
  } catch (error) {
    console.error("Error marking messages as delivered:", error);
  }

  // mark messages as seen
  socket.on("markSeen", async ({ senderId }) => {
    try {
      await Message.updateMany(
        {
          senderId,
          receiverId: userId,
          status: { $in: ["sent", "delivered"] },
        },
        { status: "seen" }
      );

      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", {
          receiverId: userId,
        });
      }
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  });

  // typing events
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
    }
  });

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.user.fullname);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    //save lastSeen timestamp to DB and broadcast to all clients
    try {
      const lastSeenTime = new Date();
      await User.findByIdAndUpdate(userId, { lastSeen: lastSeenTime });
      io.emit("userLastSeen", { userId, lastSeen: lastSeenTime });
    } catch (error) {
      console.error("Error updating lastSeen:", error);
    }
  });
});

export { io, app, server };