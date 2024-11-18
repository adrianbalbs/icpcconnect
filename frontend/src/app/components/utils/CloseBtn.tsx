import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface FunctionProps {
  handleClose: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Close Button component
 * - renders an "x" to close modals and dialogs
 */
const CloseBtn: React.FC<FunctionProps> = ({ handleClose }) => {
  return (
    <IconButton
      aria-label="close"
      onClick={handleClose}
      sx={(theme) => ({
        position: "absolute",
        right: 8,
        top: 8,
        margin: "5px 4px",
        height: "25px",
        width: "25px",
        color: theme.palette.grey[500],
      })}
    >
      <CloseIcon sx={{ height: "20px", width: "20px" }} />
    </IconButton>
  );
};

export default CloseBtn;
