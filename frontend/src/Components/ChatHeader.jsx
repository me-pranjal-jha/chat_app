import { ArrowLeftIcon, XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

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
          <p className="text-slate-400 text-sm">{isOnline ? "Online" : "Offline"}</p>
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