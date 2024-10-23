import { SERVER_URL } from "@/utils/constants";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";

export type UserSession = {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: "student" | "site_coordinator" | "coach" | "admin";
  refreshTokenVersion: number;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthContextType = {
  userSession: UserSession | null;
  isLoading: boolean;
  getSession: () => Promise<void>;
  logout: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getSession = async () => {
    try {
      const { data } = await axios.get<UserSession>(`${SERVER_URL}/api/me`, {
        withCredentials: true,
      });
      setUserSession(data);
    } catch (err) {
      setUserSession(null);
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          router.push("/login");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${SERVER_URL}/api/logout`, { withCredentials: true });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed: ", err);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const { data } = await axios.post<UserSession>(
        `${SERVER_URL}/api/login`,
        credentials,
        { withCredentials: true },
      );
      setUserSession(data);
      router.push("/teams");
    } catch (err) {
      alert(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{ userSession, isLoading, login, logout, getSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
