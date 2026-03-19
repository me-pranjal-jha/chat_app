import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import {
  MessageCircleIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  LoaderIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

function SignUpPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await signup(formData);

    if (result?.success) {
      localStorage.setItem("verifyEmail", result.email || formData.email);
      navigate("/verify-otp");
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
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Create Account
                  </h2>
                  <p className="text-slate-400">Sign up for a new account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="auth-input-label">Full Name</label>
                    <div className="relative">
                      <UserIcon className="auth-input-icon" />
                      <input
                        type="text"
                        value={formData.fullname}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fullname: e.target.value,
                          })
                        }
                        className="input w-full"
                        placeholder="Pranjal Jha"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
                        }
                        className="input w-full"
                        placeholder="24it3037@rgipt.ac.in"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="auth-input-label">Password</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        className="input w-full"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  <button
                    className="auth-btn"
                    type="submit"
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? (
                      <LoaderIcon className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="auth-link">
                    Already have an account? Login
                  </Link>
                </div>
              </div>
            </div>

            <div className="hidden md:flex md:w-1/2 h-full items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500/10 via-transparent to-slate-900/20" />
              <div className="absolute top-20 right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-16 left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-8 py-10">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-[340px] h-[340px] rounded-full bg-cyan-400/10 blur-3xl" />
                  <img
                    src="/signup.png"
                    alt="Signup illustration"
                    className="relative w-full max-w-[420px] h-auto object-contain drop-shadow-[0_10px_30px_rgba(34,211,238,0.15)]"
                  />
                </div>

                <div className="mt-10 text-center">
                  <h3 className="text-2xl font-semibold text-cyan-400">
                    Start Your Journey Today
                  </h3>
                  <p className="mt-3 text-sm text-slate-400 max-w-xs mx-auto">
                    Connect, chat, and collaborate in a fast and secure way.
                  </p>

                  <div className="mt-5 flex justify-center gap-3 flex-wrap">
                    <span className="auth-badge">Fast</span>
                    <span className="auth-badge">Secure</span>
                    <span className="auth-badge">Reliable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default SignUpPage;