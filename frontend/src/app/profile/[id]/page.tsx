'use client';

import { useEffect, useState } from 'react';
import profileStyles from '@/styles/Profile.module.css';
import pageStyles from '@/styles/Page.module.css';
import { IconButton } from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import Info from '@/components/profile/Info';
// import { getInfo } from '@/utils/profileInfo';

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

  // const storeInfo = async () => {
  //   const data = await getInfo(params.id);
  //   if (data !== undefined) {
  //     setInfo(data.info);
  //   }
  // }

  const capitalise = (name: string) => {
    if (!name) return name;
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // useEffect(() => { storeInfo() }, [params]);
  useEffect(() => {
    setInfo([['name', 'Rachel Chen'], ['pronouns', 'she/her'], ['University', 'UNSW'], ['email', 'asd'], ['studentId', '54321']]);
  }, [params]);

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

