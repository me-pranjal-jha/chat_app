import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser, getAllContacts, getMyChatPartners } = useChatStore();

  useEffect(() => {
    getAllContacts();
    getMyChatPartners();
  }, []);

  return (
    <div className="h-full w-full overflow-hidden p-4">
      <div className="mx-auto h-full w-full max-w-6xl overflow-hidden">
        <BorderAnimatedContainer>
          <div className="flex h-full w-full overflow-hidden">
            <div className="w-[320px] shrink-0 min-h-0 border-r border-slate-700/50 bg-slate-800/50 backdrop-blur-sm flex flex-col">
              <div className="shrink-0">
                <ProfileHeader />
                <ActiveTabSwitch />
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
                {activeTab === "chats" ? <ChatsList /> : <ContactList />}
              </div>
            </div>

            <div className="flex-1 min-w-0 min-h-0 bg-slate-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
              {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default ChatPage;