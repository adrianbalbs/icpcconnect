import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useState } from "react";
import CloseBtn from "../utils/CloseBtn";

const DeleteAccount = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
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
        onClick={() => setOpen(true)}
      >
        Delete Account
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <CloseBtn handleClose={handleClose} />
        <DialogContent sx={{ width: "450px", p: "40px 40px" }}>
          <FormControl sx={{ m: "10px 0", fontSize: "12px" }} fullWidth>
            <InputLabel
              id="new-invite-code-label"
              sx={{ lineHeight: "15px", fontSize: "14px" }}
            >
              New Invite Code
            </InputLabel>
          </FormControl>
          <DialogContentText
            id="invite-code"
            sx={{
              display: "flex",
              margin: "15px 0 0 14px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Invite Code:
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DeleteAccount;
