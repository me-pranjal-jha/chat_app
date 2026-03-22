import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  KeyRoundIcon,
  MailIcon,
  LoaderIcon,
  ArrowLeftIcon,
} from "lucide-react";
import BorderAnimatedContainer from "../Components/BorderAnimatedContainer";
import { useAuthStore } from "../store/useAuthStore";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { forgotPassword, isForgotPasswordLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await forgotPassword({ email });

    if (res.success) {
      localStorage.setItem("resetEmail", email.trim().toLowerCase());
      navigate("/reset-password");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl h-[580px]">
        <BorderAnimatedContainer>
          <div className="w-full h-full flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 h-full p-10 md:p-14 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-[420px]">
                <div className="text-center mb-8">
                  <KeyRoundIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Forgot Password
                  </h2>
                  <p className="text-slate-400">
                    Enter your email to receive reset OTP
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input w-full"
                        placeholder="Enter your registered email"
                        required
                      />
                    </div>
                  </div>

                  <button
                    className="auth-btn"
                    type="submit"
                    disabled={isForgotPasswordLoading}
                  >
                    {isForgotPasswordLoading ? (
                      <LoaderIcon className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ArrowLeftIcon size={16} />
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>

            <div className="hidden md:flex md:w-1/2 h-full items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500/10 via-transparent to-slate-900/20" />
              <div className="absolute top-20 right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-16 left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-8 py-10 text-center">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-[340px] h-[340px] rounded-full bg-cyan-400/10 blur-3xl" />
                  <img
                    src="/login.png"
                    alt="forgot password illustration"
                    className="relative w-full max-w-[420px] h-auto object-contain drop-shadow-[0_10px_30px_rgba(34,211,238,0.15)]"
                  />
                </div>

                <div className="mt-10">
                  <h3 className="text-2xl font-semibold text-cyan-400">
                    Recover your account
                  </h3>
                  <p className="mt-3 text-sm text-slate-400 max-w-xs mx-auto">
                    We will send a reset OTP to your registered email so you can
                    create a new password securely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;