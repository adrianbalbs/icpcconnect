import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  TextField,
} from "@mui/material";
import { useState } from "react";
import CloseBtn from "../utils/CloseBtn";
import { deleteAccBtn, purpleBtn } from "@/styles/sxStyles";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";
import { useRouter } from "next/navigation";

interface DeleteProps {
  id: string;
  user: {
    id: string;
    name: string;
  };
}

/**
 * Delete Account modal component
 * - state 1: admin password verification
 * - state 2: confirm account deletion
 * note: only admins are allowed this functionality
 *      (however admins cannot delete their own account)
 */
const DeleteAccount = ({ id, user }: DeleteProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(1);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleClose = () => {
    setOpen(false);
    setPassword("");
    setErrorMsg("");
    setStatus(1);
  };

  const verifyPassword = async () => {
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/admin/verify`,
        { id, password },
        { withCredentials: true },
      );
      if (res.data) {
        setStatus(2);
      } else {
        setErrorMsg("Incorrect password!");
      }
    } catch (err) {
      console.log(`Admin account-deletion password error: ${err}`);
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete(`${SERVER_URL}/api/admin/${user.id}`, {
        withCredentials: true,
      });
      localStorage.setItem("accountDeleted", user.name);
      console.log(localStorage.getItem("accountDeleted"));
      router.back();
    } catch (err) {
      console.log(`Admin account-deletion user error: ${err}`);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        sx={{
          mt: "30px",
          width: "218px",
          textTransform: "none",
          fontSize: "15px",
          bgcolor: "#d15c65",
        }}
        onClick={() => setOpen(true)}
      >
        Delete Account
      </Button>
      <Dialog open={open} onClose={handleClose}>
        {status !== 2 && <CloseBtn handleClose={handleClose} />}
        <DialogContent sx={{ width: "450px", p: "40px 40px 35px" }}>
          <DialogContentText
            id="admin-password"
            sx={{ display: "flex", fontWeight: "bold" }}
          >
            {status === 1
              ? "Enter Admin Password:"
              : "Are you sure you want to delete this account?"}
          </DialogContentText>
          {status === 1 && (
            <TextField
              type="password"
              placeholder="Password"
              value={password}
              sx={{
                m: "20px 0",
                "& .MuiOutlinedInput-root": {
                  "& .MuiInputBase-input": {
                    py: "10px",
                    fontSize: "14px",
                  },
                },
              }}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errorMsg}
              helperText={errorMsg}
              fullWidth
            />
          )}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            {status === 1 ? (
              <Button
                variant="contained"
                sx={{ ...purpleBtn, p: "2.5px 30px" }}
                onClick={verifyPassword}
              >
                Verify
              </Button>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "nowrap",
                  alignItems: "center",
                  mt: "25px",
                }}
              >
                <Button
                  variant="contained"
                  sx={{ ...deleteAccBtn, bgcolor: "#d15c65" }}
                  onClick={deleteAccount}
                >
                  Yes
                </Button>
                <p>or</p>
                <Button
                  variant="contained"
                  sx={{ ...deleteAccBtn, bgcolor: "#777777" }}
                  onClick={handleClose}
                >
                  No
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DeleteAccount;
