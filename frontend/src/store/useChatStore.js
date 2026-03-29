import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  typingUsers: {},
  unreadCounts: {},

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setTyping: (userId, isTyping) => {
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    }));
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) get().clearUnread(selectedUser._id);
  },

  clearUnread: (userId) => {
    set((state) => {
      const updated = { ...state.unreadCounts };
      delete updated[userId];
      return { unreadCounts: updated };
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // CHANGED: emits markSeen when chat is opened
  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });

      // tell backend to mark all messages from this user as seen
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("markSeen", { senderId: userId });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      status: "sent", 
    };

    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser: currentSelectedUser, unreadCounts } = get();
      const isFromSelectedUser =
        newMessage.senderId === currentSelectedUser?._id;

      if (isFromSelectedUser) {
        set({ messages: [...get().messages, newMessage] });

        if (get().isSoundEnabled) {
          const notificationSound = new Audio("/sounds/notification.mp3");
          notificationSound.currentTime = 0;
          notificationSound.play().catch((e) =>
            console.log("Audio play failed:", e)
          );
        }
      } else {
        set({
          unreadCounts: {
            ...unreadCounts,
            [newMessage.senderId]:
              (unreadCounts[newMessage.senderId] || 0) + 1,
          },
        });

        if (get().isSoundEnabled) {
          const notificationSound = new Audio("/sounds/notification.mp3");
          notificationSound.currentTime = 0;
          notificationSound.play().catch((e) =>
            console.log("Audio play failed:", e)
          );
        }
      }
    });

    // ✅ ADDED: update messages to delivered when receiver comes online
    socket.on("messagesDelivered", ({ receiverId }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.receiverId === receiverId && m.status === "sent"
            ? { ...m, status: "delivered" }
            : m
        ),
      }));
    });

    // ADDED: update messages to seen when receiver opens the chat
    socket.on("messagesSeen", ({ receiverId }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.receiverId === receiverId
            ? { ...m, status: "seen" }
            : m
        ),
      }));
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === selectedUser._id) {
        get().setTyping(senderId, true);
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === selectedUser._id) {
        get().setTyping(senderId, false);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messagesDelivered"); 
    socket.off("messagesSeen");      
    socket.off("typing");
    socket.off("stopTyping");
  },
}));