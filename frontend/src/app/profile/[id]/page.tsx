"use client";

import { useEffect, useState } from "react";
import profileStyles from "@/styles/Profile.module.css";
import pageStyles from "@/styles/Page.module.css";
import { Button, ButtonGroup, IconButton, Tooltip } from "@mui/material";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import Info from "@/components/profile/Info";
import { getInfo, capitalise, EditInfo } from "@/utils/profileInfo";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { Edit } from "@/components/profile/Edit";
import { useProfile } from "./layout";
import { useAuth } from "@/components/context-provider/AuthProvider";
import { cancelProfileBtn, saveProfileBtn } from "@/styles/sxStyles";
import Notif from "@/components/utils/Notif";

export interface ProfileProps {
  params: {
    id: string;
  };
}

/**
 * Profile Page
 * - button to edit profile
 */
const Profile: React.FC<ProfileProps> = ({ params }) => {
  const [profileInfo, setProfileInfo] = useState<[string, string | number][]>(
    [],
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editInfo, setEditInfo] = useState<EditInfo>({
    givenName: "",
    familyName: "",
    pronouns: "",
    languagesSpoken: [],
    photoConsent: false,
    dietaryRequirements: "",
    tshirtSize: "",
  });
  const { userSession } = useAuth();
  const { storeProfileInfo, info } = useProfile();
  const [notif, setNotif] = useState({ type: "", message: "" });

  const storeInfo = async () => {
    const data = await getInfo(params.id);
    if (data !== undefined) {
      setProfileInfo(data.info);
      setEditInfo(data.editInfo);
    }
  };
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setIsEditing(false);
    try {
      const update = {
        pronouns: editInfo.pronouns === "" ? undefined : editInfo.pronouns,
        languagesSpoken: editInfo.languagesSpoken,
        photoConsent: editInfo.photoConsent,
        tshirtSize:
          editInfo.tshirtSize === "" ? undefined : editInfo.tshirtSize,
        dietaryRequirements:
          editInfo.dietaryRequirements === ""
            ? undefined
            : editInfo.dietaryRequirements,
      };
      await axios.patch(
        `${SERVER_URL}/api/users/${params.id}/student-details`,
        update,
        {
          withCredentials: true,
        },
      );
      if (info.role !== "Student") {
        // Update object for coach, site coordinator and admin
        const update = {
          givenName: editInfo.givenName,
          familyName: editInfo.familyName,
        };
        await axios.patch(`${SERVER_URL}/api/users/${params.id}`, update, {
          withCredentials: true,
        });
      }

      storeInfo();
      storeProfileInfo();
      setNotif({ type: "edit", message: "Profile Updated Successfully!" });
    } catch (error) {
      console.error("Failed to update:", error);
      setNotif({ type: "delete", message: "Profile Update Failed!" });
    }
  };

  const checkView = () => {
    return (
      "Admin Coach".includes(userSession.role) || userSession.id === params.id
    );
  };

  useEffect(() => {
    storeInfo();
  }, [params.id]);

  return (
    <div className={profileStyles["inner-screen"]}>
      <div className={profileStyles.title}>
        <h3>Profile</h3>
        {checkView() &&
          (isEditing ? (
            <ButtonGroup sx={{ ml: "auto" }}>
              <Button sx={saveProfileBtn} onClick={handleSaveClick}>
                Save
              </Button>
              <Button sx={cancelProfileBtn} onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </ButtonGroup>
          ) : (
            <Tooltip title="Edit Profile" placement="right">
              <IconButton onClick={handleEditClick}>
                <EditTwoToneIcon />
              </IconButton>
            </Tooltip>
          ))}
      </div>
      <hr className={pageStyles.divider} />

      {!isEditing ? (
        profileInfo.map((i) => (
          <Info key={i[0]} name={capitalise(i[0])} value={i[1]} />
        ))
      ) : (
        <Edit role={info.role} editInfo={editInfo} setEditInfo={setEditInfo} />
      )}
      {notif.type !== "" && <Notif notif={notif} setNotif={setNotif} />}
    </div>
  );
};

export default Profile;
