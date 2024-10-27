import axios from 'axios';
import { SERVER_URL } from './constants';
import { StudentInfo } from '@/components/members/Students';
import { nameToId } from './university';

export interface EditInfo {
  pronouns: string,
  languagesSpoken: string[],
  photoConsent: boolean,
  dietaryRequirements: string,
  tshirtSize: string | null,
}

interface Info {
  id: string;
  info: [string, string | number][];
  sideInfo: { name: string; role: string; pronouns: string; };
  editInfo: EditInfo;
}

const current: Info = {
  id: '',
  info: [],
  sideInfo: {
    name: '',
    role: '',
    pronouns: '',
  },
  editInfo: {
    pronouns: "",
    languagesSpoken: [],
    photoConsent: false,
    dietaryRequirements: "",
    tshirtSize: "",
  }
};

export const getInfo = async (id: string | null) => {
  if (id === null) return current;
  // if (id === current.id) return current;

  try {
    console.log("fetch");
    const res = await axios.get(`${SERVER_URL}/api/admin/${id}`);
    const data: StudentInfo = res.data;
    const languages = data.languagesSpoken?.map(i => i.name).toString();
    const infoArr: [string, string | number][] = [
      ['Name', `${data.givenName} ${data.familyName}`],
      ['Pronouns', data.pronouns],
      ['Team', data.team ? data.team : '(Unallocated)'],
      ['University', nameToId(data.university)],
      ['Student ID', data.studentId],
      ['Languages Spoken', languages ? languages : '(Not added yet)'],
      ['Dietary Requirements', data.dietaryRequirements],
      ['Do you consent to appear in photos taken at the contest?', data.photoConsent ? 'Yes' : 'No'],
      ['T-Shirt Size', data.tShirtSize ? data.tShirtSize : '(Not added yet)']
    ];
    current.id = data.id;
    current.info = infoArr;
    current.sideInfo = {
      name: `${data.givenName} ${data.familyName}`,
      role: data.role,
      pronouns: data.pronouns
    };
    current.editInfo = {
      pronouns: data.pronouns,
      languagesSpoken: data.languagesSpoken ? data.languagesSpoken.map(l => l.code) : [],
      photoConsent: data.photoConsent,
      dietaryRequirements: data.dietaryRequirements,
      tshirtSize: data.tShirtSize,
    }
    return current;
  } catch (error) {
    console.log(error);
  }
}

export const capitalise = (name: string) => {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}