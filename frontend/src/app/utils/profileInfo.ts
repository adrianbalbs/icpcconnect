import axios from 'axios';
import { SERVER_URL } from './constants';
import { StudentInfo } from '@/components/members/Students';

interface Info {
  id: string;
  university: string;
  info: [string, string | number][];
  sideInfo: { name: string; role: string; pronouns: string; };
  languagesSpoken?: { code: string; name: string; }[];
}

const current: Info = {
  id: '',
  university: '',
  info: [],
  sideInfo: {
    name: '',
    role: '',
    pronouns: '',
  },
  languagesSpoken: [],
};

export const getInfo = async (id: string | null) => {
  if (id === null) return current;
  if (id === current.id) return current;

  try {
    const res = await axios.get(`${SERVER_URL}/api/admin/${id}`);
    const data: StudentInfo = res.data;
    const languages = data.languagesSpoken?.map(i => i.name).toString();
    const infoArr: [string, string | number][] = [
      ['Name', `${data.givenName} ${data.familyName}`],
      ['Pronouns', data.pronouns ? data.pronouns : '(Not added yet)'],
      ['Team', data.team ? data.team : '(Unallocated)'],
      ['University', data.university],
      ['Student ID', data.studentId],
      ['Languages Spoken', languages ? languages : '(Not added yet)'],
      ['Dietary Requirements', data.dietaryRequirements ? data.dietaryRequirements : '(Not added yet)'],
      ['Do you consent to appear in photos and videos taken on the day of the contest?', data.photoConsent ? 'Yes' : 'No']
    ];
    current.id = data.id;
    current.university = data.university;
    current.info = infoArr;
    current.sideInfo = {
      name: `${data.givenName} ${data.familyName}`,
      role: data.role,
      pronouns: data.pronouns
    };
    current.languagesSpoken = data.languagesSpoken;
    return current;
  } catch (error) {
    console.log(error);
  }
}

export const capitalise = (name: string) => {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}