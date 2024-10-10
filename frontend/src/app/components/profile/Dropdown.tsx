import { Divider, Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';

interface DropdownProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  handleClose: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({ anchorEl, open, handleClose }) => {
  const router = useRouter();
  const ownId = '1';

  const to = (route: string) => {
    router.push(`/profile/${ownId}${route}`);
    handleClose();
  }

  const logout = () => {
    router.push('/login');
    localStorage.removeItem('role');
  }

  return <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={handleClose}
    MenuListProps={{
      'aria-labelledby': 'basic-button',
    }}
  >
    <MenuItem sx={{ fontSize: '13px' }} onClick={() => to('')}>Profile</MenuItem>
    <MenuItem sx={{ fontSize: '13px' }} onClick={() => to('/experience')}>Experience</MenuItem>
    <MenuItem sx={{ fontSize: '13px' }} onClick={() => to('/preferences')}>Preferences</MenuItem>
    <MenuItem sx={{ fontSize: '13px' }} onClick={() => to('/account-settings')}>Account settings</MenuItem>
    <Divider />
    <MenuItem sx={{ fontSize: '13px' }} onClick={logout}>Logout</MenuItem>
  </Menu>
}

export default Dropdown;
