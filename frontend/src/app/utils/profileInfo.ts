import axios from 'axios';
import { SERVER_URL } from './constants';
import { StudentInfo } from '@/components/members/Students';

interface Info {
  id: string;
  info: [string, string | number][];
  sideInfo: { name: string; role: string; pronouns: string; };
}

const current: Info = {
  id: '',
  info: [],
  sideInfo: {
    name: '',
    role: '',
    pronouns: ''
  }
};

const infoToRemove = ['id', 'givenName', 'familyName', 'role'];

export const getInfo = async (id: string | null) => {
  if (id === null) return current;
  if (id === current.id) return current;

  try {
    const res = await axios.get(`${SERVER_URL}/api/admin/${id}`);
    const data: StudentInfo = res.data;
    const infoObject = { name: `${data.givenName} ${data.familyName}`, ...data };
    current.sideInfo = {
      name: infoObject.name,
      role: infoObject.role,
      pronouns: infoObject.pronouns
    };
    const infoArr = Object.entries(infoObject).filter(i => !infoToRemove.includes(i[0]));
    current.info = infoArr;
    return current;
  } catch (error) {
    console.log(error);
  }
}

export const capitalise = (name: string) => {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}
