import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isVerifyingOtp: false,
  isForgotPasswordLoading: false,
  isResetPasswordLoading: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (error) {
      console.log("Error in authCheck:", error);
      get().disconnectSocket();
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);

      toast.success(res.data.message || "OTP sent successfully");

      return {
        success: true,
        email: res.data.email,
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      return { success: false };
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyOtp: async (data) => {
    set({ isVerifyingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);

      set({ authUser: res.data.user || res.data });
      toast.success(res.data.message || "OTP verified successfully");
      get().connectSocket();

      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP entered");
      return { success: false };
    } finally {
      set({ isVerifyingOtp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user || res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      return { success: true };
    } catch (error) {
      set({ authUser: null });
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  forgotPassword: async (data) => {
    set({ isForgotPasswordLoading: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", data);
      toast.success(res.data.message || "OTP sent to your email");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      return { success: false };
    } finally {
      set({ isForgotPasswordLoading: false });
    }
  },

  resetPasswordWithOtp: async (data) => {
    set({ isResetPasswordLoading: true });
    try {
      const res = await axiosInstance.post("/auth/reset-password", data);
      toast.success(res.data.message || "Password reset successful");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      return { success: false };
    } finally {
      set({ isResetPasswordLoading: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out successfully");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Error logging out");
      console.log("Logout error:", error);
      return { success: false };
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data.user || res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();

    if (!authUser) return;

    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(BASE_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, onlineUsers: [] });
  },
}));