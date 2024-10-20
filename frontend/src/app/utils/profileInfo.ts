import axios from "axios";
import { SERVER_URL } from "./constants";
import { StudentInfo } from "@/components/members/Students";
import { nameToId } from "./university";

export interface EditInfo {
  pronouns: string;
  languagesSpoken: string[];
  photoConsent: boolean;
  dietaryRequirements: string;
  tshirtSize: string | null;
}

interface Info {
  id: string;
  university: string;
  info: [string, string | number][];
  sideInfo: { name: string; role: string; pronouns: string };
  editInfo: EditInfo;
}

const current: Info = {
  id: "",
  university: "",
  info: [],
  sideInfo: {
    name: "",
    role: "",
    pronouns: "",
  },
  editInfo: {
    pronouns: "",
    languagesSpoken: [],
    photoConsent: false,
    dietaryRequirements: "",
    tshirtSize: "",
  },
};

export const getInfo = async (id: string | null) => {
  if (id === null) return current;
  // if (id === current.id) return current;

  try {
    console.log("fetch");
    const res = await axios.get(`${SERVER_URL}/api/admin/${id}`);
    const data: StudentInfo = res.data;
    const languages = data.languagesSpoken?.map((i) => i.name).join(", ");
    console.log(data);
    const infoArr: [string, string | number][] = [
      ["Name", `${data.givenName} ${data.familyName}`],
      ["Team", data.team ?? "(Unallocated)"],
      ["University", nameToId(data.university)],
      ["Student ID", data.studentId],
      ["Languages Spoken", languages ?? "(Not added yet)"],
      [
        "Dietary Requirements",
        data.dietaryRequirements ? data.dietaryRequirements : "(Not added yet)",
      ],
      [
        "Do you consent to appear in photos taken at the contest?",
        data.photoConsent ? "Yes" : "No",
      ],
      ["T-Shirt Size", data.tshirtSize ?? "(Not added yet)"],
    ];
    current.id = data.id;
    current.id = data.university;
    current.info = infoArr;
    current.sideInfo = {
      name: `${data.givenName} ${data.familyName}`,
      role: data.role,
      pronouns: data.pronouns,
    };
    current.editInfo = {
      pronouns: data.pronouns,
      languagesSpoken: data.languagesSpoken
        ? data.languagesSpoken.map((l) => l.code)
        : [],
      photoConsent: data.photoConsent,
      dietaryRequirements: data.dietaryRequirements,
      tshirtSize: data.tshirtSize,
    };
    return current;
  } catch (error) {
    console.log(error);
  }
};

export const capitalise = (name: string) => {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
};
