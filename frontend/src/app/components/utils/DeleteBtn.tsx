import { IconButton } from "@mui/material";
import { GridDeleteIcon } from "@mui/x-data-grid";
import { useAuth } from "../AuthProvider/AuthProvider";

interface BtnProps {
  id: string;
  handleDelete: () => Promise<void>;
}

const DeleteBtn = ({ id, handleDelete }: BtnProps) => {
  const { userSession } = useAuth();
  if (userSession.id === id || userSession.role === "Admin")
    return (
      <IconButton
        sx={{
          height: "21px",
          width: "25px",
          borderRadius: "5px",
          justifySelf: "end",
        }}
        onClick={handleDelete}
      >
        <GridDeleteIcon sx={{ fontSize: "21px" }} />
      </IconButton>
    );
};

export default DeleteBtn;
