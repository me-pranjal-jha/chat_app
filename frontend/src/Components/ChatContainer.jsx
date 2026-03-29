import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { SearchIcon, XIcon, TrashIcon } from "lucide-react"; //

function MessageStatus({ status, isMine }) {
  if (!isMine) return null;
  if (status === "seen")
    return <span className="text-sm text-cyan-300 font-bold">✓✓</span>;
  if (status === "delivered")
    return <span className="text-sm text-slate-300 font-semibold">✓✓</span>;
  return <span className="text-sm text-slate-400">✓</span>;
}

function HighlightedText({ text, query }) {
  if (!query || !text) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-cyan-500/40 text-cyan-200 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
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
    messageSearchQuery,
    messageSearchResults,
    isSearchingMessages,
    searchMessagesInChat,
    deleteMessage, 
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messagesContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const isTyping = typingUsers[selectedUser?._id];
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [hoveredMessageId, setHoveredMessageId] = useState(null); 

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

  const handleMessageSearch = (query) => {
    setLocalSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      searchMessagesInChat(selectedUser._id, query);
    }, 400);
  };

  const closeSearch = () => {
    setShowMessageSearch(false);
    setLocalSearchQuery("");
    searchMessagesInChat(selectedUser._id, "");
  };

  //  confirm and delete message
  const handleDeleteMessage = (messageId) => {
    if (window.confirm("Delete this message for everyone?")) {
      deleteMessage(messageId);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="shrink-0">
        <ChatHeader />
      </div>

      {showMessageSearch && (
        <div className="shrink-0 px-4 py-2 border-b border-slate-700/50 bg-slate-800/30 flex items-center gap-2">
          <SearchIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={localSearchQuery}
            onChange={(e) => handleMessageSearch(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 bg-transparent text-slate-200 placeholder-slate-400 text-sm focus:outline-none"
          />
          {isSearchingMessages && (
            <span className="text-xs text-slate-400">Searching...</span>
          )}
          <button onClick={closeSearch}>
            <XIcon className="w-4 h-4 text-slate-400 hover:text-slate-200" />
          </button>
        </div>
      )}

      {showMessageSearch && localSearchQuery && (
        <div className="shrink-0 max-h-48 overflow-y-auto border-b border-slate-700/50 bg-slate-900/80">
          {messageSearchResults.length === 0 && !isSearchingMessages ? (
            <p className="text-slate-400 text-xs text-center py-3">
              No messages found for "{localSearchQuery}"
            </p>
          ) : (
            messageSearchResults.map((msg) => (
              <div
                key={msg._id}
                className="px-4 py-2 hover:bg-slate-800/50 border-b border-slate-700/30 last:border-0"
              >
                <p className="text-xs text-slate-400 mb-0.5">
                  {new Date(msg.createdAt).toLocaleDateString([], {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-sm text-slate-200">
                  <HighlightedText
                    text={msg.text}
                    query={localSearchQuery}
                  />
                </p>
              </div>
            ))
          )}
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-6 py-6"
      >
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-6 break-words">
            {messages.map((msg) => {
              const isMine = msg.senderId === authUser._id;
              const isHovered = hoveredMessageId === msg._id;

              return (
                <div
                  key={msg._id}
                  className={`chat ${isMine ? "chat-end" : "chat-start"}`}
                  onMouseEnter={() => setHoveredMessageId(msg._id)} 
                  onMouseLeave={() => setHoveredMessageId(null)}     
                >
                  {/* delete button on hover for own messages */}
                  <div className="chat-header flex items-center gap-2">
                    {isMine && isHovered && !msg.isDeleted && (
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete message"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div
                    className={`chat-bubble max-w-[75%] break-words whitespace-pre-wrap ${
                      isMine
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {/* show deleted message placeholder */}
                    {msg.isDeleted ? (
                      <p className="italic text-sm opacity-60">
                        🚫 This message was deleted
                      </p>
                    ) : (
                      <>
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Shared"
                            className="rounded-lg mb-2 max-h-60 w-auto object-cover"
                          />
                        )}
                        {msg.text && <p>{msg.text}</p>}
                      </>
                    )}

                    {/*hide ticks on deleted messages */}
                    {!msg.isDeleted && (
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <p className="text-xs opacity-75">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <MessageStatus
                          status={msg.status}
                          isMine={isMine}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

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

      <div className="shrink-0 flex justify-end px-4 pt-1">
        <button
          onClick={() => setShowMessageSearch((prev) => !prev)}
          className={`text-xs flex items-center gap-1 transition-colors ${
            showMessageSearch
              ? "text-cyan-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <SearchIcon className="w-3.5 h-3.5" />
          Search messages
        </button>
      </div>

      <div className="shrink-0">
        <MessageInput />
      </div>
    </div>
  );
}

export default ChatContainer;