import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../model/Message.js";
import User from "../model/user.model.js";
import { ENV } from "../lib/env.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl = "";

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat-app-messages",
        resource_type: "image",
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: otherUserId } = req.params;
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
      text: { $regex: query.trim(), $options: "i" },
    }).sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in searchMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// delete message for everyone
export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // only sender can delete
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    // mark as deleted instead of removing from DB
    message.isDeleted = true;
    message.text = null;
    message.image = null;
    await message.save();

    // notify receiver in real time
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ success: true, messageId });
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};