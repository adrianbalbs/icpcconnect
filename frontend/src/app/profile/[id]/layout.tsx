"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import profileStyles from "@/styles/Profile.module.css";
import image from "@/assets/image.png";
import Sidebar from "@/components/Sidebar";
import { getInfo } from "@/utils/profileInfo";
import { IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

interface ProfileLayoutProps {
  children: React.ReactNode;
  params: {
    id: string;
  };
}

type ProfileContextData = {
  storeProfileInfo: () => Promise<void>;
  info: { name: string; role: string; pronouns: string };
};
const ProfileContext = createContext<ProfileContextData>(
  {} as ProfileContextData,
);

export function useProfile() {
  const context = useContext(ProfileContext);
  return context;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children, params }) => {
  const router = useRouter();
  const [info, setInfo] = useState({ name: "", role: "", pronouns: "" });

  const storeInfo = async () => {
    const data = await getInfo(params.id);
    if (data !== undefined) {
      setInfo(data.sideInfo);
    }
  };

  useEffect(() => {
    storeInfo();
  }, [params.id]);

  return (
    <ProfileContext.Provider value={{ info, storeProfileInfo: storeInfo }}>
      <div className={profileStyles.screen}>
        <div className={profileStyles["side-screen"]}>
          <Image src={image} alt="pfp" className={profileStyles.pfp} />
          <h1 className={profileStyles.name}>{info.name}</h1>
          <p
            className={profileStyles.role}
          >{`${info.role}${info.pronouns ? ` • ${info.pronouns}` : ""}`}</p>
          <Sidebar id={params.id} />
        </div>
        <IconButton sx={{ marginTop: "40px" }} onClick={() => router.back()}>
          <ArrowBackIosIcon />
        </IconButton>
        {children}
      </div>
    </ProfileContext.Provider>
  );
};
export default ProfileLayout;
