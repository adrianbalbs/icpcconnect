'use client';

import { useEffect, useState } from 'react';
import profileStyles from '@/styles/Profile.module.css';
import pageStyles from '@/styles/Page.module.css';
import { IconButton } from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import Info from '@/components/profile/Info';
import { getInfo, capitalise } from '@/utils/profileInfo';
import axios from 'axios';
import { SERVER_URL } from '@/utils/constants';

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
  };

  const handleInfoChange = (index: number, newValue: string | number) => {
    const updatedInfo = [...info];
    updatedInfo[index] = [updatedInfo[index][0], newValue];
    setInfo(updatedInfo);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    setIsEditing(false);
    const data = await getInfo(params.id);
    console.log(data);
    if (data !== undefined) {
      data.info = info;
      axios.put(`${SERVER_URL}/students/${params.id}`, data);
    }
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
      {info.map((i, index) => (
        <Info
          key={i[0]}
          name={capitalise(i[0])}
          value={i[1]}
          edit={isEditing}
          onChange={(newValue) => handleInfoChange(index, newValue)}
        />
      ))}
      <button className={profileStyles['profile-button']} onClick={handleSaveClick}>
        Save
      </button>
    </div>
  );
}

export default Profile;
