import { useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

function Auth0SessionSync() {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();
  const { authUser } = useAuthStore();
  const hasSynced = useRef(false);

  useEffect(() => {
    const syncAuth0Session = async () => {
      if (isLoading) return;
      if (!isAuthenticated) return;
      if (hasSynced.current) return;
      if (authUser) return; // don't re-sync if already logged in via JWT

      try {
        const token = await getAccessTokenSilently();

        const res = await axiosInstance.post(
          "/auth/auth0-login",
          { profile: user },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        useAuthStore.setState({
          authUser: res.data.user || res.data,
        });

        useAuthStore.getState().connectSocket();
        hasSynced.current = true;
      } catch (error) {
        console.log("Auth0 session sync failed:", error);
      }
    };

    syncAuth0Session();
  }, [isAuthenticated, isLoading, getAccessTokenSilently, user, authUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      hasSynced.current = false;
    }
  }, [isAuthenticated]);

  return null;
}

export default Auth0SessionSync;