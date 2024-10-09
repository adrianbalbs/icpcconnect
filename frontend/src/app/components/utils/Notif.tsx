'use client';

import { Dispatch, SetStateAction, useEffect } from 'react';
import styled from '@emotion/styled';
import Alert from '@mui/material/Alert';

export interface NotifType {
  type: string;
  name: string;
}

interface NotifProps {
  visible: boolean;
  notif: {
    type: string;
    name: string;
  },
  setNotif: Dispatch<SetStateAction<NotifType>>;
}

const LongAlert = styled(Alert)<{ visible: boolean }>`
  display: ${(props) => (props.visible ? 'block' : 'none')};
  margin-top: 60px;
  margin-bottom: -60px;
`;

const Notif: React.FC<NotifProps> = ({ visible, notif, setNotif }) => {
  useEffect(() => {
    if (notif !== undefined && notif.type !== '') {
      const timeout = setTimeout(() => {
        setNotif({ type: '', name: '' });
      }, 2000);
      
    return () => clearTimeout(timeout);
    }
  }, [visible]);

  return (
    <LongAlert visible={visible} severity={notif.type === 'invite' ? "success" : "error"}>
      {notif.type === 'invite'
        ? `New ${notif.name} invite code copied to clipboard successfully`
        : `${notif.name}'s account deleted successfully`
      }
    </LongAlert>
  );
}

export default Notif;
