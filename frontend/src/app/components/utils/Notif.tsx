"use client";

import Alert from "@mui/material/Alert";
import { Snackbar } from "@mui/material";

export interface NotifType {
  type: string;
  message: string;
}

interface NotifProps {
  notif: NotifType;
  setNotif: (value: NotifType) => void;
}

/**
 * Notif component
 * - renders snackbar with two colours
 *    - green: create, add, update, edit, success
 *    - red: delete, fail
 */
const Notif: React.FC<NotifProps> = ({ notif, setNotif }) => {
  const onClose = () => {
    setNotif({ type: "", message: "" });
  };

  return (
    <Snackbar
      open={notif.type !== ""}
      autoHideDuration={3000}
      onClose={onClose}
    >
      <Alert
        severity={notif.type === "delete" ? "error" : "success"}
        variant="filled"
        onClose={onClose}
        sx={{
          height: "50px",
          width: "100%",
          bgcolor: notif.type === "delete" ? "#d15c65" : "#7BA381",
        }}
      >
        {notif.message}
      </Alert>
    </Snackbar>
  );
};

export default Notif;
