import { Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import {useAuthStore} from "./store/useAuthStore"

function App() {

    const {authUser ,login , isLoggedIn} = useAuthStore()

    console.log("auth-user:", authUser);
    console.log('isLoggedIn', isLoggedIn);
    
    

  return (
    <div className="min-h-screen bg-slate-950 relative flex items-center justify-center p-4 overflow-hidden">

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
      <div className="relative z-20 min-h-screen flex items-center justify-center flex-col">

    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
    </Routes>

<button onClick={login} className="z-10 mt-4  ">login</button>
      </div>

    </div>
  );
}

export default App;