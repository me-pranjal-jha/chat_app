import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../Components/BorderAnimatedContainer";
import ProfileHeader from "../Components/ProfileHeader";
import ActiveTabSwitch from "../Components/ActiveTabSwitch";
import ChatsList from "../Components/ChatsList";
import ContactList from "../Components/ContactList";
import ChatContainer from "../Components/ChatContainer";
import NoConversationPlaceholder from "../Components/NoConversationPlaceholder";

function ChatPage() {
  const {
    activeTab,
    selectedUser,
    getAllContacts,
    getMyChatPartners,
  } = useChatStore();

  useEffect(() => {
    getAllContacts();
    getMyChatPartners();
  }, [getAllContacts, getMyChatPartners]);

  return (
    <div className="w-full h-screen flex items-center justify-center p-4 md:p-6 overflow-hidden">
      <div className="w-full max-w-6xl h-[650px] min-h-[650px]">
        <BorderAnimatedContainer>
          <div className="w-full h-full flex overflow-hidden rounded-2xl">
            <div className="w-[320px] min-w-[320px] max-w-[320px] h-full border-r border-slate-700/50 bg-slate-800/50 backdrop-blur-sm flex flex-col">
              <div className="shrink-0">
                <ProfileHeader />
                <ActiveTabSwitch />
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
                {activeTab === "chats" ? <ChatsList /> : <ContactList />}
              </div>
            </div>

            <div className="flex-1 min-w-0 h-full bg-slate-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
              {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default ChatPage;