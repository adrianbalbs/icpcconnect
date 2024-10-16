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
  // const getInfo = async () => {
  //   try {
  //     const res = await axios.get(`${SERVER_URL}/${params.id}`);
  //     const data: StudentInfo = res.data.info;
  //     const infoObject = { name: `${data.givenName} ${data.familyName}`, ...data };
  //     setSideInfo({
  //       name: infoObject.name,
  //       role: infoObject.role,
  //       pronouns: infoObject.pronouns
  //     });
  //     const infoArr = Object.entries(infoObject).filter(i => !infoToRemove.includes(i[0]));
  //     setInfo(infoArr);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  const storeInfo = async () => {
    const data = await getInfo(params.id);
    if (data !== undefined) {
      setInfo(data.info);
    }
  }

  useEffect(() => { storeInfo() }, [params]);
  // useEffect(() => {
  //   setInfo([['name', 'Rachel Chen'], ['University', 'UNSW'], ['email', 'z5432123@ad.unsw.edu.au'], ['studentId', '5432123']]);
  // }, [params]);

  return (
    <div className={profileStyles['inner-screen']}>
      <div className={profileStyles.title}>
        <h1>Profile</h1>
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

