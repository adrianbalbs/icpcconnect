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
import { purpleBtn } from "@/styles/sxStyles";
import axios from "axios";
import { SERVER_URL } from "@/utils/constants";

const DeleteAccount = ({ id }: { id: string }) => {
  const [openStatus, setOpenStatus] = useState(0);
  const [password, setPassword] = useState("");

  const handleClose = () => {
    setOpenStatus(0);
  };

  const verifyPassword = async () => {
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/admin/verify`,
        { id, password },
        { withCredentials: true },
      );
      console.log(res);
      setOpenStatus(2);
    } catch (error) {
      console.log(`Admin account deletion password error: ${error}`);
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
          bgcolor: "#DF7981",
        }}
        onClick={() => setOpenStatus(1)}
      >
        Delete Account
      </Button>
      <Dialog open={openStatus === 1} onClose={handleClose}>
        <CloseBtn handleClose={handleClose} />
        <DialogContent sx={{ width: "450px", p: "40px 40px 35px" }}>
          <DialogContentText
            id="admin-password"
            sx={{ display: "flex", fontWeight: "bold" }}
          >
            Enter Admin Password:
          </DialogContentText>
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
            fullWidth
          />
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              sx={{ ...purpleBtn, p: "2.5px 30px" }}
              onClick={verifyPassword}
            >
              Verify
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DeleteAccount;
