import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface FunctionProps {
  handleClose: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const CloseBtn: React.FC<FunctionProps> = ({ handleClose }) => {
  return <IconButton
    aria-label="close"
    onClick={handleClose}
    sx={(theme) => ({
      position: 'absolute',
      right: 8,
      top: 8,
      color: theme.palette.grey[500],
    })}
  >
    <CloseIcon />
  </IconButton>
}

export default CloseBtn;