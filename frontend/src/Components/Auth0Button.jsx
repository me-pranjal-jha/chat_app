import { useAuth0 } from "@auth0/auth0-react";

function Auth0Button({ mode = "login" }) {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleClick = () => {
    if (mode === "signup") {
      loginWithRedirect({
        authorizationParams: {
          screen_hint: "signup",
        },
      });
    } else {
      loginWithRedirect();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="w-full mt-4 bg-white text-slate-900 font-semibold py-3 rounded-lg hover:bg-slate-100 transition duration-200"
    >
      {mode === "signup" ? "Continue with Google" : "Login with Google"}
    </button>
  );
}

export default Auth0Button;