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
  searchQuery: "",
  messageSearchQuery: "",
  messageSearchResults: [],
  isSearchingMessages: false,

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
    set({
      selectedUser,
      messageSearchQuery: "",
      messageSearchResults: [],
    });
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
  setSearchQuery: (query) => set({ searchQuery: query }),

  searchMessagesInChat: async (otherUserId, query) => {
    if (!query.trim()) {
      set({ messageSearchResults: [], messageSearchQuery: "" });
      return;
    }
    set({ isSearchingMessages: true, messageSearchQuery: query });
    try {
      const res = await axiosInstance.get(
        `/messages/search/${otherUserId}?query=${encodeURIComponent(query)}`
      );
      set({ messageSearchResults: res.data });
    } catch (error) {
      toast.error("Search failed");
      set({ messageSearchResults: [] });
    } finally {
      set({ isSearchingMessages: false });
    }
  },

  // delete message action
  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);

      // update message in state immediately (optimistic)
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: null, image: null }
            : m
        ),
      }));

      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

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

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
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

    // handle message deleted event from receiver's side
    socket.on("messageDeleted", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: null, image: null }
            : m
        ),
      }));
    });

    socket.on("messagesDelivered", ({ receiverId }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.receiverId === receiverId && m.status === "sent"
            ? { ...m, status: "delivered" }
            : m
        ),
      }));
    });

    socket.on("messagesSeen", ({ receiverId }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.receiverId === receiverId ? { ...m, status: "seen" } : m
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
    socket.off("messageDeleted"); 
    socket.off("messagesDelivered");
    socket.off("messagesSeen");
    socket.off("typing");
    socket.off("stopTyping");
  },
}));