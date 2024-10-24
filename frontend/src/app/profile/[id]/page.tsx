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
    const nameSplit = (info[0][1] as string).split(/\s+/); //separate name into first and last names
    const firstName = nameSplit[0];
    const lastName = nameSplit[1];
    console.log(info);
    const pronouns = info[1][1] === '(Not added yet)' ? null : info[1][1];
    const team = info[2][1] === '(Unallocated)' ? null : info[2][1];
    const languagesSpoken = info[5][1] === '(Not added yet)' ? [] : info[5][1];
    const dietaryRequirements = info[6][1] === '(Not added yet)' ? null : info[6][1];
    const photoConsent = info[7][1] === 'Yes';
    const tshirtSize = info[8][1] === '(Not added yet)' ? null : info[8][1];

    const update = {
      firstName,
      lastName,
      pronouns,
      team,
      university: 0, //change this later
      studentId: info[4][1],
      languagesSpoken,
      photoConsent,
      dietaryRequirements,
      tshirtSize,
    }
    console.log(update);
    console.log(`${SERVER_URL}/api/students/${params.id}`);
    try {
      await axios.put(`${SERVER_URL}/api/students/${params.id}`, update);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  useEffect(() => { storeInfo() }, [params]);
  
  return (
    <div className={profileStyles['inner-screen']}>
      <div className={profileStyles.title}>
        <h1>Profile</h1>
        {isEditing ? (
          <button className={profileStyles['profile-button']} onClick={handleSaveClick}>
            Save
          </button>
        ) : (
          <IconButton onClick={handleEditClick}>
            <EditTwoToneIcon />
          </IconButton>
        )}
        
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
      
    </div>
  );
}

export default Profile;
