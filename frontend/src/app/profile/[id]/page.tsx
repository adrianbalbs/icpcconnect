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
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const storeInfo = async () => {
    const data = await getInfo(params.id);
    if (data !== undefined) {
      setInfo(data.info);
    }
  }

  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
  };
  
  useEffect(() => { storeInfo() }, [params]);

  return (
    <div className={profileStyles['inner-screen']}>
      <div className={profileStyles.title}>
        <h1>Profile</h1>
        <IconButton onClick={handleEditClick}>
          <EditTwoToneIcon />
        </IconButton>
      </div>
      <hr className={pageStyles.divider}/>
      {info.map(i => <Info key={i[0]} name={capitalise(i[0])} value={i[1]} edit={isEditing} />)}
    </div>
  );
}

export default Profile;

