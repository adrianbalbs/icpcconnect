'use client';

import { useEffect, useState } from 'react';
import profileStyles from '@/styles/Profile.module.css';
import pageStyles from '@/styles/Page.module.css';
import { IconButton } from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import Info from '@/components/profile/Info';
import { getInfo, capitalise } from '@/utils/profileInfo';

export interface ProfileProps {
  params: {
    id: string;
  };
}

const Profile: React.FC<ProfileProps> = ({ params }) => {
  const [info, setInfo] = useState<[string, string | number][]>([]);

  const storeInfo = async () => {
    const data = await getInfo(params.id);
    if (data !== undefined) {
      setInfo(data.info);
    }
  }

  useEffect(() => { storeInfo() }, [params]);

  return (
    <div className={profileStyles['inner-screen']}>
      <div className={profileStyles.title}>
        <h3>Profile</h3>
        <IconButton>
          <EditTwoToneIcon />
        </IconButton>
      </div>
      <hr className={pageStyles.divider}/>
      {info.map(i => <Info key={i[0]} name={capitalise(i[0])} value={i[1]} />)}
    </div>
  );
}

export default Profile;

