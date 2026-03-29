import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

// ✅ updated: bigger, bolder, outside opacity wrapper
function MessageStatus({ status, isMine }) {
  if (!isMine) return null;

  if (status === "seen")
    return <span className="text-sm text-cyan-300 font-bold">✓✓</span>;
  if (status === "delivered")
    return <span className="text-sm text-slate-300 font-semibold">✓✓</span>;
  return <span className="text-sm text-slate-400">✓</span>;
}

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messagesContainerRef = useRef(null);

  const isTyping = typingUsers[selectedUser?._id];

  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="shrink-0">
        <ChatHeader />
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-6 py-6"
      >
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-6 break-words">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${
                  msg.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
              >
                <div
                  className={`chat-bubble max-w-[75%] break-words whitespace-pre-wrap ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Shared"
                      className="rounded-lg mb-2 max-h-60 w-auto object-cover"
                    />
                  )}
                  {msg.text && <p>{msg.text}</p>}

                  {/* ✅ CHANGED: time and ticks separated so opacity only affects time */}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <p className="text-xs opacity-75">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <MessageStatus
                      status={msg.status}
                      isMine={msg.senderId === authUser._id}
                    />
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat chat-start">
                <div className="chat-bubble bg-slate-800 text-green-400 text-sm flex items-center gap-2">
                  <span>typing</span>
                  <span className="flex gap-0.5 items-center">
                    <span
                      className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullname} />
        )}
      </div>

      <div className="shrink-0">
        <MessageInput />
      </div>
    </div>
  );
}

export default ChatContainer;