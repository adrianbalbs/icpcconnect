import axios from "axios";
import { useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import { addBtn, addModal, modalInputBox } from "@/styles/sxStyles";
import pageStyles from "@/styles/Page.module.css";
import { Box, Button, Paper } from "@mui/material";
import CloseBtn from "../utils/CloseBtn";
import { useAuth } from "../AuthProvider/AuthProvider";
import ModalInput from "../utils/ModalInput";

const ChangePasswordModal = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const {
    userSession: { id },
  } = useAuth();

  const handleSubmit = async () => {
    try {
      await axios.put(
        `${SERVER_URL}/api/users/${id}/password`,
        { oldPassword, newPassword },
        { withCredentials: true },
      );
      setOpen(false);
    } catch (error) {
      console.log(`Change password error: ${error}`);
    }
  };

  const isInvalidInput = () => {
    return newPassword === "" || newPassword !== confirmNewPassword;
  };

  return (
    <Paper square elevation={3} sx={addModal}>
      <CloseBtn handleClose={() => setOpen(false)} />
      <p className={pageStyles["modal-heading"]}>Change Password</p>
      <hr className={pageStyles.divider} />
      <Box sx={{ ...modalInputBox }}>
        <ModalInput
          label="Old Password:"
          type="password"
          placeholder="Enter Old Password"
          value={oldPassword}
          handleChange={(e) => setOldPassword(e.target.value)}
          disabled={false}
          gap={"15px"}
        />
        <ModalInput
          label="New Password:"
          type="password"
          placeholder="Enter New Password"
          value={newPassword}
          handleChange={(e) => setNewPassword(e.target.value)}
          disabled={false}
          gap={"15px"}
        />
        <ModalInput
          label="Confirm New Password:"
          type="password"
          placeholder="Confirm Password"
          value={confirmNewPassword}
          handleChange={(e) => setConfirmNewPassword(e.target.value)}
          disabled={false}
        />
      </Box>
      <Button
        variant="contained"
        sx={addBtn}
        onClick={handleSubmit}
        disabled={isInvalidInput()}
      >
        Submit
      </Button>
    </Paper>
  );
};

export default ChangePasswordModal;
