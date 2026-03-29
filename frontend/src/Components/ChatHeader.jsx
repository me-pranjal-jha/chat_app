import { ArrowLeftIcon, XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

// formats lastSeen timestamp nicely
function formatLastSeen(lastSeen) {
  if (!lastSeen) return "last seen recently";

  const date = new Date(lastSeen);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) {
    return `last seen today at ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });

  return `last seen ${dateStr} at ${timeStr}`;
}

function ChatHeader() {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers, socket } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = typingUsers[selectedUser._id];

  // stores lastSeen per userId
  const [lastSeenMap, setLastSeenMap] = useState({});

  // listen for real time lastSeen updates
  useEffect(() => {
    if (!socket) return;

    socket.on("userLastSeen", ({ userId, lastSeen }) => {
      setLastSeenMap((prev) => ({ ...prev, [userId]: lastSeen }));
    });

    return () => {
      socket.off("userLastSeen");
    };
  }, [socket]);

  // also load lastSeen from selectedUser's DB field on mount
  useEffect(() => {
    if (selectedUser?.lastSeen) {
      setLastSeenMap((prev) => ({
        ...prev,
        [selectedUser._id]: selectedUser.lastSeen,
      }));
    }
  }, [selectedUser]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  // decide what to show under the name
  const getStatusText = () => {
    if (isOnline && isTyping) {
      return <span className="text-green-400 text-sm">typing...</span>;
    }
    if (isOnline) {
      return <span className="text-green-400 text-sm">Online</span>;
    }
    return (
      <span className="text-slate-400 text-sm">
        {formatLastSeen(lastSeenMap[selectedUser._id])}
      </span>
    );
  };

  return (
    <div className="h-20 px-4 md:px-6 border-b border-slate-700/50 bg-slate-800/40 flex items-center justify-between overflow-hidden">
      <div className="flex items-center gap-3 min-w-0">

        {/* Back button — mobile only */}
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden text-slate-400 hover:text-slate-200 transition-colors mr-1"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>

        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-12 rounded-full">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullname}
            />
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-slate-200 font-medium truncate">
            {selectedUser.fullname}
          </h3>
          {/* dynamic status text */}
          {getStatusText()}
        </div>
      </div>

      {/* X button — desktop only */}
      <button onClick={() => setSelectedUser(null)} className="hidden md:block">
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}

export default ChatHeader;