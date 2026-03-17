import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import PageLoader from "./Components/PageLoader";
import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />

      {/* Grid */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#38bdf820_1px,transparent_1px),linear-gradient(to_bottom,#38bdf820_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Glow blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[420px] h-[420px] bg-purple-600/30 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[420px] h-[420px] bg-cyan-500/30 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute top-[20%] right-[15%] w-[260px] h-[260px] bg-fuchsia-500/20 rounded-full blur-[120px] animate-bounce" />
      <div className="absolute bottom-[20%] left-[15%] w-[260px] h-[260px] bg-teal-400/20 rounded-full blur-[120px] animate-bounce" />

      {/* Content */}
      <div className="relative z-20 w-full min-h-screen">
        <Routes>
          <Route path="/" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        </Routes>
      </div>

      <Toaster />
    </div>
  );
}

export default App;