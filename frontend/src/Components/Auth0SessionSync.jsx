import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

function Auth0SessionSync() {
  const { isAuthenticated, user } = useAuth0();
  const { checkAuth } = useAuthStore();
  const synced = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!isAuthenticated || synced.current) return;

      try {
        await axios.post(
          "http://localhost:3000/api/auth/auth0-login",
          {
            profile: {
              email: user?.email,
              name: user?.name,
              picture: user?.picture,
              sub: user?.sub,
            },
          },
          { withCredentials: true }
        );

        await checkAuth();
        synced.current = true;
      } catch (err) {
        console.error("Auth0 sync failed:", err);
      }
    };

    syncUser();
  }, [isAuthenticated, user, checkAuth]);

  return null;
}

export default Auth0SessionSync;