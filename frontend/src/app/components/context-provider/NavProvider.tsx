import { createContext, useContext, useEffect, useState } from "react";
import Navbar from "../bar/Navbar";
import { useAuth } from "./AuthProvider";
import { usePathname } from "next/navigation";
import { getInfo } from "@/utils/profileInfo";

type NavContextData = {
  storeNavInfo: () => Promise<void>;
  navInfo: { name: string; role: string; pfp: string };
};

const NavContext = createContext<NavContextData>({} as NavContextData);

export function useNav() {
  const context = useContext(NavContext);
  return context;
}

/**
 * Nav Context component
 * - provides context for navbar elements ie. profile pic, name, role
 */
export const NavContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userSession, isLoading } = useAuth();
  const pathname = usePathname();
  const [navInfo, setNavInfo] = useState({ name: "", role: "", pfp: "" });

  const storeNavInfo = async () => {
    const data = await getInfo(userSession.id);
    if (data !== undefined) {
      const { name, role } = data.sideInfo;
      setNavInfo({ name, role, pfp: data.profilePic });
    }
  };

  useEffect(() => {
    if (!isLoading) {
      storeNavInfo();
    }
  }, [isLoading]);

  return (
    <NavContext.Provider value={{ navInfo, storeNavInfo }}>
      {!isLoading && userSession.id && !pathname.includes("404") && <Navbar />}
      {children}
    </NavContext.Provider>
  );
};
