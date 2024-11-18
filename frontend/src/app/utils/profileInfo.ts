import axios from "axios";
import { SERVER_URL } from "./constants";
import { StudentInfo } from "@/components/members/Students";
import { UserSession } from "@/components/context-provider/AuthProvider";

export interface EditInfo {
  givenName: string;
  familyName: string;
  pronouns: string;
  languagesSpoken: string[];
  photoConsent: boolean;
  dietaryRequirements: string;
  tshirtSize: string | null;
}

export interface EditInfo {
  givenName: string;
  familyName: string;
  pronouns: string;
}

interface Info {
  id: string;
  university: string;
  studentId: string;
  profilePic: string;
  info: [string, string | number][];
  sideInfo: { name: string; role: string; pronouns: string };
  editInfo: EditInfo;
}

const current: Info = {
  id: "",
  university: "",
  studentId: "",
  profilePic: "",
  info: [],
  sideInfo: {
    name: "",
    role: "",
    pronouns: "",
  },
  editInfo: {
    givenName: "",
    familyName: "",
    pronouns: "",
    languagesSpoken: [],
    photoConsent: false,
    dietaryRequirements: "",
    tshirtSize: "",
  },
};

export const getInfo = async (id: string | null | undefined) => {
  if (!id) return current;
  try {
    const res = await axios.get(`${SERVER_URL}/api/users/${id}`, {
      withCredentials: true,
    });
    const data: StudentInfo = res.data;
    current.id = data.id;
    current.university = data.university;
    current.profilePic = data.profilePic;
    current.sideInfo = {
      name: `${data.givenName} ${data.familyName}`,
      role: data.role,
      pronouns: data.pronouns,
    };
    current.editInfo = {
      givenName: data.givenName,
      familyName: data.familyName,
      pronouns: data.pronouns,
      languagesSpoken: data.languagesSpoken
        ? data.languagesSpoken.map((l) => l.code)
        : [],
      photoConsent: data.photoConsent,
      dietaryRequirements: data.dietaryRequirements,
      tshirtSize: data.tshirtSize,
    };
    if (data.role === "Student") {
      const languages = data.languagesSpoken?.map((i) => i.name).join(", ");
      current.info = [
        ["Name", `${data.givenName} ${data.familyName}`],
        ["Team", data.team ?? "(Unallocated)"],
        ["University", data.university],
        ["Student ID", data.studentId],
        ["Languages Spoken", languages ?? "(Not added yet)"],
        [
          "Dietary Requirements",
          data.dietaryRequirements
            ? data.dietaryRequirements
            : "(Not added yet)",
        ],
        [
          "Do you consent to appear in photos taken at the contest?",
          data.photoConsent ? "Yes" : "No",
        ],
        ["T-Shirt Size", data.tshirtSize ?? "(Not added yet)"],
      ];
      current.studentId = data.studentId;
    } else if (data.role !== "Admin") {
      current.info = [
        ["Name", `${data.givenName} ${data.familyName}`],
        [data.role === "Coach" ? "University" : "Site", data.university],
        ["Email", data.email],
      ];
    } else {
      current.info = [
        ["Name", `${data.givenName} ${data.familyName}`],
        ["Email", data.email],
      ];
    }
    return current;
  } catch (error) {
    console.log(`Get info error: ${error}`);
  }
};

export const capitalise = (name: string) => {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const checkViewingPermissions = (
  id: string,
  userSession: UserSession,
) => {
  return "Admin Coach".includes(userSession.role) || userSession.id === id;
};
