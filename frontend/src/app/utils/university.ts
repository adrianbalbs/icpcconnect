import axios from "axios";
import { SERVER_URL } from "./constants";

export const university = [
  "Select University",
  "University of New South Wales",
  "University of Sydney",
  "University of Technology Sydney",
  "Macquarie University",
];

type University = {
  id: number;
  name: string;
  hostedAt: number;
};

export const nameToId = (name: string) => {
  return university.indexOf(name);
};

export const universityToSite = async (university: string) => {
  try {
    const res = await axios.get(`${SERVER_URL}/api/users/universities`, {
      withCredentials: true,
    });
    const { allUnis } = res.data;
    const givenUni = allUnis.find((u: University) => u.name === university);
    const site = allUnis.find((u: University) => u.id === givenUni.hostedAt);
    return site.name;
  } catch (error) {
    console.log(`Get universities error: ${error}`);
    return "";
  }
};

export const siteToUniversity = async (site: string) => {
  try {
    const res = await axios.get(`${SERVER_URL}/api/users/universities`, {
      withCredentials: true,
    });
    const { allUnis } = res.data;
    const givenSite = allUnis.find((u: University) => u.name === site);
    const unis = allUnis
      .filter((u: University) => u.hostedAt === givenSite.id)
      .map((u: University) => u.name);
    return unis;
  } catch (error) {
    console.log(`Get universities error: ${error}`);
    return [];
  }
};
