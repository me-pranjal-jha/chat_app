import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactList() {
  const {
    getAllContacts,
    allContacts,
    setSelectedUser,
    isUsersLoading,
    searchQuery, 
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

 
  const filteredContacts = allContacts.filter((contact) =>
    contact.fullname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
     
      {filteredContacts.length === 0 && searchQuery && (
        <p className="text-slate-400 text-sm text-center py-4">
          No contacts found for "{searchQuery}"
        </p>
      )}

      {filteredContacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${
                onlineUsers.includes(contact._id) ? "online" : "offline"
              }`}
            >
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium">{contact.fullname}</h4>
          </div>
        </div>
      ))}
    </>
  );
}

export default ContactList;