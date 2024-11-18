import axios from "axios";
import { useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import { addBtn, addModal, modalInputBox } from "@/styles/sxStyles";
import pageStyles from "@/styles/Page.module.css";
import { Box, Button, Paper } from "@mui/material";
import CloseBtn from "../utils/CloseBtn";
import { useAuth } from "../context-provider/AuthProvider";
import ModalInput from "../utils/ModalInput";

interface Errors {
  old?: string;
  new?: string;
}

/**
 * Change Password dialog component
 * - renders three input boxes:
 *    - old password
 *    - new password
 *    - confirm password
 * - errors:
 *    - old password is incorrect
 *    - confirm password does not match with new password
 */
const ChangePasswordDialog = ({
  setOpen,
  setMsg,
}: {
  setOpen: (open: boolean) => void;
  setMsg: (msg: string) => void;
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const {
    userSession: { id },
  } = useAuth();

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setErrors({ new: "New passwords do not match." });
      return;
    }
    try {
      await axios.put(
        `${SERVER_URL}/api/users/${id}/password`,
        { oldPassword, newPassword },
        { withCredentials: true },
      );
      setOpen(false);
      setErrors({});
      setMsg("Password Updated Successfully!");
    } catch (error) {
      console.log(`Change password error: ${error}`);
      setErrors({ old: "Old password is incorrect." });
    }
  };

  const isInputEmpty = () => {
    return oldPassword === "" || newPassword === "" || confirmPassword === "";
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
          gap={"15px"}
          errorMsg={errors.old}
        />
        <ModalInput
          label="New Password:"
          type="password"
          placeholder="Enter New Password"
          value={newPassword}
          handleChange={(e) => setNewPassword(e.target.value)}
          gap={"15px"}
        />
        <ModalInput
          label="Confirm New Password:"
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          handleChange={(e) => setConfirmPassword(() => e.target.value)}
          errorMsg={errors.new}
        />
      </Box>
      <Button
        variant="contained"
        sx={addBtn}
        onClick={handleSubmit}
        disabled={isInputEmpty()}
      >
        Submit
      </Button>
    </Paper>
  );
};

export default ChangePasswordDialog;
