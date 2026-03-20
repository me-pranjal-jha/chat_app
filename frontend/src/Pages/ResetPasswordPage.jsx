import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  KeyRoundIcon,
  LockIcon,
  LoaderIcon,
  MailIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { useAuthStore } from "../store/useAuthStore";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const {
    resetPasswordWithOtp,
    isResetPasswordLoading,
    forgotPassword,
    isForgotPasswordLoading,
  } = useAuthStore();

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");

    if (!storedEmail) {
      navigate("/forgot-password");
      return;
    }

    setEmail(storedEmail);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    const res = await resetPasswordWithOtp({
      email,
      otp: formData.otp,
      newPassword: formData.newPassword,
    });

    if (res.success) {
      localStorage.removeItem("resetEmail");
      navigate("/login");
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    await forgotPassword({ email });
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl h-[650px]">
        <BorderAnimatedContainer>
          <div className="w-full h-full flex flex-col md:flex-row">
            {/* LEFT SIDE */}
            <div className="w-full md:w-1/2 h-full p-10 md:p-14 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-[420px]">
                <div className="text-center mb-8">
                  <LockIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Reset Password
                  </h2>
                  <p className="text-slate-400">
                    Enter OTP and set your new password
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="input w-full opacity-70 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="auth-input-label">OTP</label>
                    <div className="relative">
                      <KeyRoundIcon className="auth-input-icon" />
                      <input
                        type="text"
                        value={formData.otp}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            otp: e.target.value,
                          })
                        }
                        className="input w-full"
                        placeholder="Enter OTP"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="auth-input-label">New Password</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            newPassword: e.target.value,
                          })
                        }
                        className="input w-full"
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="auth-input-label">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="input w-full"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>

                  <button
                    className="auth-btn"
                    type="submit"
                    disabled={isResetPasswordLoading}
                  >
                    {isResetPasswordLoading ? (
                      <LoaderIcon className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isForgotPasswordLoading}
                  className="w-full mt-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-70"
                >
                  {isForgotPasswordLoading ? "Resending OTP..." : "Resend OTP"}
                </button>

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

            {/* RIGHT SIDE */}
            <div className="hidden md:flex md:w-1/2 h-full items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500/10 via-transparent to-slate-900/20" />
              <div className="absolute top-20 right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-16 left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-8 py-10 text-center">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-[340px] h-[340px] rounded-full bg-cyan-400/10 blur-3xl" />
                  <img
                    src="/login.png"
                    alt="reset password illustration"
                    className="relative w-full max-w-[420px] h-auto object-contain drop-shadow-[0_10px_30px_rgba(34,211,238,0.15)]"
                  />
                </div>

                <div className="mt-10">
                  <h3 className="text-2xl font-semibold text-cyan-400">
                    Verify and continue
                  </h3>
                  <p className="mt-3 text-sm text-slate-400 max-w-xs mx-auto">
                    Enter the OTP sent to your email and create a strong new
                    password.
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

export default ResetPasswordPage;