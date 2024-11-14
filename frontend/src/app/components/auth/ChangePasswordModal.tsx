import { addModal } from "@/styles/sxStyles";
import { Button, Paper, TextField } from "@mui/material";
import CloseBtn from "../utils/CloseBtn";
import { useState } from "react";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { useAuth } from "../AuthProvider/AuthProvider";

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
    } catch (error) {
      console.log(`Change password error: ${error}`);
    }
  };

  const isDisabled = () => {
    return newPassword === "" || newPassword !== confirmNewPassword;
  };

  return (
    <>
      <Paper square elevation={3} sx={addModal}>
        <CloseBtn handleClose={() => setOpen(false)} />
        <form onSubmit={handleSubmit}>
          <TextField
            label="Old Password"
            type="password"
            variant="filled"
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            variant="filled"
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            variant="filled"
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          <Button disabled={isDisabled()}>Submit</Button>
        </form>
      </Paper>
    </>
  );
};

export default ChangePasswordModal;
