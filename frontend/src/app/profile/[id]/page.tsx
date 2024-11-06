"use client";

import { useEffect, useState } from "react";
import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";
import { IconButton } from "@mui/material";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import Info from "@/components/profile/Info";
import { getInfo, capitalise, EditInfo } from "@/utils/profileInfo";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { Edit } from "@/components/profile/Edit";

export interface ProfileProps {
  params: {
    id: string;
  };
}

const Profile: React.FC<ProfileProps> = ({ params }) => {
  const [info, setInfo] = useState<[string, string | number][]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editInfo, setEditInfo] = useState<EditInfo>({
    pronouns: "",
    languagesSpoken: [],
    photoConsent: false,
    dietaryRequirements: "",
    tshirtSize: "",
  });

  const storeInfo = async () => {
    const data = await getInfo(params.id);
    if (data !== undefined) {
      setInfo(data.info);
      setEditInfo(data.editInfo);
    }
  };
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setIsEditing(false);
    const update = {
      pronouns: editInfo.pronouns === "" ? null : editInfo.pronouns,
      languagesSpoken: editInfo.languagesSpoken,
      photoConsent: editInfo.photoConsent,
      tshirtSize: editInfo.tshirtSize === "" ? null : editInfo.tshirtSize,
      dietaryRequirements:
        editInfo.dietaryRequirements === ""
          ? null
          : editInfo.dietaryRequirements,
    };
    try {
      await axios.put(`${SERVER_URL}/api/students/${params.id}`, update, {
        withCredentials: true,
      });
      storeInfo();
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  useEffect(() => {
    storeInfo();
  }, [params.id]);

  return (
    <div className={profileStyles["inner-screen"]}>
      <div className={profileStyles.title}>
        <h3>Profile</h3>
        {isEditing ? (
          <button
            className={profileStyles["profile-button"]}
            onClick={handleSaveClick}
          >
            Save
          </button>
        ) : (
          <IconButton onClick={handleEditClick}>
            <EditTwoToneIcon />
          </IconButton>
        )}
      </div>
      <hr className={pageStyles.divider} />

      {!isEditing ? (
        info.map((i) => (
          <Info key={i[0]} name={capitalise(i[0])} value={i[1]} />
        ))
      ) : (
        <Edit editInfo={editInfo} setEditInfo={setEditInfo} />
      )}
    </div>
  );
};

export default Profile;
