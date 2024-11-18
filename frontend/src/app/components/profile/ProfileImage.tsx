import { useState } from "react";
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

const ProfileImage = () => {
  const [image, setImage] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      setAnchorEl(null);
    } catch (error) {
      console.log(`Upload profile image error: ${error}`);
    }
  };

  const handleDelete = async () => {
    try {
      setImage(null);
      setAnchorEl(null);
    } catch (error) {
      console.log(`Delete profile image error: ${error}`);
    }
  };

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
    </Box>
  );
};

export default ProfileImage;
