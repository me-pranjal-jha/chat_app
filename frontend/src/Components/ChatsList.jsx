import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const {
    getMyChatPartners,
    chats,
    isUsersLoading,
    setSelectedUser,
    unreadCounts,
    searchQuery, 
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  
  const filteredChats = chats.filter((chat) =>
    chat.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      
      {filteredChats.length === 0 && searchQuery && (
        <p className="text-slate-400 text-sm text-center py-4">
          No chats found for "{searchQuery}"
        </p>
      )}

      {filteredChats.map((chat) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`avatar ${
                  onlineUsers.includes(chat._id) ? "online" : "offline"
                }`}
              >
                <div className="size-12 rounded-full">
                  <img
                    src={chat.profilePic || "/avatar.png"}
                    alt={chat.fullname}
                  />
                </div>
              </div>
              <h4 className="text-slate-200 font-medium truncate">
                {chat.fullname}
              </h4>
            </div>

            {unreadCounts[chat._id] > 0 && (
              <span className="min-w-[22px] h-5 px-1.5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCounts[chat._id] > 99 ? "99+" : unreadCounts[chat._id]}
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export default ChatsList;