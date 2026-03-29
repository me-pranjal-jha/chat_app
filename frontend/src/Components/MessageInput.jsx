import { useRef, useState, useEffect } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon, SmileIcon } from "lucide-react";
import EmojiPicker from "emoji-picker-react"; 

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); 

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null); 

  const { sendMessage, isSoundEnabled, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  // close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // append emoji to text
  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (isSoundEnabled) playRandomKeyStrokeSound();

    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (socket && selectedUser) {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }
    }, 1500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    if (socket && selectedUser) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setShowEmojiPicker(false); // close picker on send
    sendMessage({ text: text.trim(), image: imagePreview });
    setText("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 border-t border-slate-700/50">
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* emoji picker positioned above input */}
      <div className="max-w-3xl mx-auto relative">
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-14 left-0 z-50"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              searchDisabled={false}
              skinTonesDisabled
              height={380}
              width={320}
            />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="max-w-3xl mx-auto flex space-x-2"
      >
        {/* emoji toggle button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={`bg-slate-800/50 rounded-lg px-3 transition-colors ${
            showEmojiPicker
              ? "text-cyan-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <SmileIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={text}
          onChange={handleTyping}
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4 text-slate-200 placeholder-slate-400"
          placeholder="Type your message..."
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-3 transition-colors ${
            imagePreview ? "text-cyan-500" : ""
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;