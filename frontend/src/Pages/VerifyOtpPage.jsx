import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import {
  ShieldCheckIcon,
  MailIcon,
  KeyRoundIcon,
  LoaderIcon,
} from "lucide-react";

function VerifyOtpPage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("verifyEmail") || "";

  const [otp, setOtp] = useState("");
  const { verifyOtp, isVerifyingOtp } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return;
    }

    const result = await verifyOtp({ email, otp });

    if (result?.success) {
      localStorage.removeItem("verifyEmail");
      navigate("/");
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
                  <ShieldCheckIcon className="w-12 h-12 mx-auto text-cyan-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Verify OTP
                  </h2>
                  <p className="text-slate-400">
                    Enter the OTP sent to your email
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="auth-input-label">Registered Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="input w-full opacity-70 cursor-not-allowed"
                        placeholder="Email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="auth-input-label">OTP</label>
                    <div className="relative">
                      <KeyRoundIcon className="auth-input-icon" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="input w-full"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <button
                    className="auth-btn"
                    type="submit"
                    disabled={isVerifyingOtp}
                  >
                    {isVerifyingOtp ? (
                      <LoaderIcon className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/signup" className="auth-link">
                    Back to Signup
                  </Link>
                </div>
              </div>
            </div>

            <div className="hidden md:flex md:w-1/2 h-full items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500/10 via-transparent to-slate-900/20" />
              <div className="absolute top-20 right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-16 left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-8 py-10 text-center">
                <h3 className="text-2xl font-semibold text-cyan-400">
                  Secure Verification
                </h3>
                <p className="mt-3 text-sm text-slate-400 max-w-xs mx-auto">
                  Verify your email to continue to Chatify and access the chat
                  page.
                </p>

                <div className="mt-5 flex justify-center gap-3 flex-wrap">
                  <span className="auth-badge">OTP Protected</span>
                  <span className="auth-badge">Secure Access</span>
                  <span className="auth-badge">Verified Users</span>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default VerifyOtpPage;