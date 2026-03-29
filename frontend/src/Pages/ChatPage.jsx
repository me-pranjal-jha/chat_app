import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../Components/BorderAnimatedContainer";
import ProfileHeader from "../Components/ProfileHeader";
import ActiveTabSwitch from "../Components/ActiveTabSwitch";
import ChatsList from "../Components/ChatsList";
import ContactList from "../Components/ContactList";
import ChatContainer from "../Components/ChatContainer";
import NoConversationPlaceholder from "../Components/NoConversationPlaceholder";
import SearchBar from "../Components/SearchBar";

function ChatPage() {
  const {
    activeTab,
    selectedUser,
    getAllContacts,
    getMyChatPartners,
    searchQuery,
    setSearchQuery,
  } = useChatStore();

  useEffect(() => {
    getAllContacts();
    getMyChatPartners();
  }, [getAllContacts, getMyChatPartners]);

  return (
    <div className="w-full h-screen flex items-center justify-center p-2 md:p-6 overflow-hidden">
      <div className="w-full max-w-6xl h-full md:h-[650px] md:min-h-[650px]">
        <BorderAnimatedContainer>
          <div className="w-full h-full flex overflow-hidden rounded-2xl">
            {/* SIDEBAR */}
            <div
              className={`
                ${selectedUser ? "hidden md:flex" : "flex"}
                w-full md:w-[320px] md:min-w-[320px] md:max-w-[320px]
                h-full border-r border-slate-700/50 bg-slate-800/50
                backdrop-blur-sm flex-col
              `}
            >
              <div className="shrink-0">
                <ProfileHeader />
                <ActiveTabSwitch />

                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery("")}
                  placeholder={
                    activeTab === "chats"
                      ? "Search chats..."
                      : "Search contacts..."
                  }
                />
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
                {activeTab === "chats" ? <ChatsList /> : <ContactList />}
              </div>
            </div>

            {/* CHAT AREA */}
            <div
              className={`
                ${selectedUser ? "flex" : "hidden md:flex"}
                flex-1 min-w-0 h-full bg-slate-900/50
                backdrop-blur-sm flex-col
              `}
            >
              {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default ChatPage;
