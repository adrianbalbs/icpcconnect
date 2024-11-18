"use client";

import axios from "axios";
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { SERVER_URL } from "@/utils/constants";
import Button from "@mui/material/Button";
import pageStyles from "@/styles/Page.module.css";
import { purpleBtn } from "@/styles/sxStyles";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Dialog, DialogContent, DialogContentText } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import CloseBtn from "./CloseBtn";
import { NotifType } from "./Notif";

interface InviteCodeProps {
  setNotif: Dispatch<SetStateAction<NotifType>>;
}

/**
 * Invite Code component
 * - renders button that opens up modal
 *    - selection box for coach / site coordinator
 *    - button:
 *      - pressed once generates code
 *      - pressed second time copies code and closes modal
 */
const InviteCode: React.FC<InviteCodeProps> = ({ setNotif }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("Generate");
  const [code, setCode] = useState("");
  const [type, setType] = useState("");

  const generate = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/${type}`, {
        withCredentials: true,
      });
      const newCode = res.data.code;
      setCode(newCode);
    } catch (error) {
      alert(`Get url: ${SERVER_URL}/api/${type} -- error -- ${error}`);
    }
  };

  const copyToClipboard = async () => {
    try {
      const role = type === "newCoachCode" ? "Coach" : "Site Coordinator";
      await navigator.clipboard.writeText(code);
      setNotif({
        type: "invite",
        message: `New ${role} Invite Code Copied!`,
      });
    } catch (error) {
      console.error("Failed to copy: ", error);
    }
  };

  const handleOpen = () => {
    setStatus("Generate");
    setCode("");
    setType("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelect = (event: SelectChangeEvent) => {
    setType(event.target.value);
  };

  const handleButton = () => {
    if (status === "Generate") {
      generate();
      setStatus("Copy code");
    } else {
      copyToClipboard();
      handleClose();
    }
  };

  useEffect(() => {
    if (type !== "") {
      setStatus("Generate");
      setCode("");
    }
  }, [type]);

  return (
    <>
      <Button
        sx={purpleBtn}
        variant="contained"
        startIcon={<PersonAddIcon />}
        onClick={handleOpen}
      >
        New Invite Code
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="new-invite-code"
        aria-describedby="generate-invite-code"
      >
        <CloseBtn handleClose={handleClose} />
        <DialogContent sx={{ width: "450px", p: "40px 40px 30px" }}>
          <FormControl sx={{ m: "10px 0", fontSize: "12px" }} fullWidth>
            <InputLabel
              id="new-invite-code-label"
              sx={{ lineHeight: "15px", fontSize: "14px" }}
            >
              New Invite Code
            </InputLabel>
            <Select
              id="select-type"
              value={type}
              label="New Invite Code"
              sx={{ height: "45px", fontSize: "14px" }}
              onChange={handleSelect}
            >
              <MenuItem sx={{ fontSize: "14px" }} value="newSiteCoordCode">
                Site Coordinator
              </MenuItem>
              <MenuItem sx={{ fontSize: "14px" }} value="newCoachCode">
                Coach
              </MenuItem>
            </Select>
          </FormControl>
          <hr className={pageStyles.divider} />
          <DialogContentText
            id="invite-code"
            sx={{
              display: "flex",
              margin: "17px 0 0 14px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Invite Code:
            <div className={pageStyles.code}>{code}</div>
          </DialogContentText>
        </DialogContent>
        <Button
          variant="contained"
          sx={{ ...purpleBtn, margin: "0 auto 30px", width: "170px" }}
          onClick={handleButton}
          disabled={type === ""}
        >
          {status}
        </Button>
      </Dialog>
    </>
  );
};

export default InviteCode;
