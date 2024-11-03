import { SERVER_URL } from "@/utils/constants";
import axios, { AxiosError } from "axios";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserSession = {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  role: "student" | "site_coordinator" | "coach" | "admin";
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthContextType = {
  userSession: UserSession;
  isLoading: boolean;
  getSession: () => Promise<void>;
  logout: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
};

const defaultSession: UserSession = {
  id: "",
  givenName: "",
  familyName: "",
  email: "",
  role: "student",
};
const AuthContext = createContext<AuthContextType>({} as AuthContextType);
const publicRoutes = ["/login", "/register"];

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userSession, setUserSession] = useState<UserSession>(defaultSession);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const getSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get<UserSession>(
        `${SERVER_URL}/api/auth/me`,
        {
          withCredentials: true,
        },
      );
      setUserSession(data);
    } catch (err) {
      setUserSession(defaultSession);
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          if (!publicRoutes.includes(pathname)) {
            router.push("/login");
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = async () => {
    try {
      setIsLoading(true);
      await axios.post(
        `${SERVER_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
      setUserSession(defaultSession);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const { data } = await axios.post<UserSession>(
        `${SERVER_URL}/api/auth/login`,
        credentials,
        { withCredentials: true },
      );
      setUserSession(data);
      router.push(data.role === "student" ? "/team" : "/teams");
    } catch (err) {
      alert(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSession();
  }, [getSession]);

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