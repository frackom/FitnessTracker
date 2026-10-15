import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as authApi from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const currentUser = await authApi.getCurrentUser();

        if (active) {
          setUser(currentUser);
        }
      } catch {
        if (active) {
          setSessionError(
            "Unable to check your session. Make sure the backend is running, then refresh."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  async function signIn(email, password) {
    await authApi.login(email, password);

    const currentUser = await authApi.getCurrentUser();

    if (!currentUser) {
      throw new Error(
        "Login succeeded, but the session cookie was not received. Check your HTTPS setup."
      );
    }

    setUser(currentUser);
    setSessionError("");
  }

  async function signOut() {
    await authApi.logout();
    setUser(null);
    setSessionError("");
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, sessionError, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}