import { IconButton, Tooltip } from "@mui/material";
import { GridDeleteIcon } from "@mui/x-data-grid";
import { useAuth } from "../context-provider/AuthProvider";

interface BtnProps {
  id: string;
  handleDelete: () => Promise<void>;
}

/**
 * Delete Button component
 * - renders a bin button to delete experiences / preferences
 */
const DeleteBtn = ({ id, handleDelete }: BtnProps) => {
  const { userSession } = useAuth();
  if (userSession.id === id || userSession.role === "Admin")
    return (
      <Tooltip title="Delete" placement="left">
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
      </Tooltip>
    );
};

export default DeleteBtn;
