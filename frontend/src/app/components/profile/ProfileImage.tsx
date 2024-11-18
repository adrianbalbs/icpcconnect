import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Popover,
  Tooltip,
  tooltipClasses,
} from "@mui/material";

import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { imageEditBtn } from "@/styles/sxStyles";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { useNav } from "../context-provider/NavProvider";
import Notif from "../utils/Notif";

/**
 * Profile Image component
 * - renders the side screen profile image
 * - pencil edit button overlapped on top - on click brings up:
 *    - upload (add new image)
 *    - remove (delete existing)
 */
const ProfileImage = ({ id, ownId }: { id: string; ownId: string }) => {
  const [image, setImage] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { storeNavInfo } = useNav();
  const [notif, setNotif] = useState({ type: "", message: "" });

  const fetchImage = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/users/${id}`, {
        withCredentials: true,
      });
      setImage(res.data.profilePic);
    } catch (error) {
      console.log(`Get profile image error: ${error}`);
    }
  };

  const updateImage = async (profilePic: string) => {
    try {
      await axios.patch(
        `${SERVER_URL}/api/users/${id}/student-details`,
        { profilePic },
        { withCredentials: true },
      );
      if (id === ownId) storeNavInfo();
      setNotif({
        type: "add",
        message: "Profile Picture Updated Successfully!",
      });
    } catch (error) {
      console.log(`Upload profile image error: ${error}`);
      setNotif({
        type: "delete",
        message: "Profile Picture Update Failed - Image Must Not Exceed 10MB!",
      });
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        updateImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    try {
      await axios.patch(
        `${SERVER_URL}/api/users/${id}/student-details`,
        { profilePic: "" },
        { withCredentials: true },
      );
      setImage(null);
      setAnchorEl(null);
      if (id === ownId) storeNavInfo();
      setNotif({
        type: "delete",
        message: "Profile Picture Deleted!",
      });
    } catch (error) {
      console.log(`Delete profile image error: ${error}`);
    }
  };

  useEffect(() => {
    fetchImage();
  }, []);

  return (
    <Box sx={{ position: "relative", width: "218px", height: "218px" }}>
      <Avatar
        src={image || ""}
        sx={{
          width: "218px",
          height: "218px",
          border: "0.8px solid #888888",
          bgcolor: "#b3bac9",
        }}
      />
      <Tooltip
        title="Edit Profile Picture"
        placement="bottom-start"
        slotProps={{
          popper: {
            sx: {
              [`&.${tooltipClasses.popper}[data-popper-placement*="bottom"] .${tooltipClasses.tooltip}`]:
                {
                  marginTop: "3px",
                },
            },
          },
        }}
      >
        <IconButton
          sx={{
            position: "absolute",
            right: "12px",
            bottom: "12px",
            bgcolor: "#7D84AF",
            color: "white",
            "&:hover": {
              bgcolor: "#969fdd",
            },
          }}
          onClick={handleClick}
        >
          <CreateOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{ width: "150px" }}
      >
        <Button
          component="label"
          htmlFor="upload"
          startIcon={<CloudUploadOutlinedIcon />}
          sx={imageEditBtn}
        >
          Upload
          <input
            id="upload"
            type="file"
            accept="image/*"
            hidden
            onChange={handleUpload}
          />
        </Button>
        <Button
          startIcon={<DeleteOutlineOutlinedIcon />}
          sx={imageEditBtn}
          onClick={handleDelete}
        >
          Remove
        </Button>
      </Popover>
      {notif.type !== "" && <Notif notif={notif} setNotif={setNotif} />}
    </Box>
  );
};

export default ProfileImage;
