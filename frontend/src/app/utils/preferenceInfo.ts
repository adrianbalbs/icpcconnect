import axios from "axios";
import { SERVER_URL } from "./constants";

export const getPreferences = async (id: string, type: string) => {
  try {
    if (id === null) return undefined;
    const res = await axios.get(
      `${SERVER_URL}/api/users/${id}/student-details/${type}`,
      { withCredentials: true },
    );
    return res.data[type];
  } catch (error) {
    console.log(`Get ${type} preferences error: ${error}`);
  }
};

export const updatePreferences = async (
  id: string,
  type: string,
  updated: string,
) => {
  try {
    if (id === null) return;
    await axios.patch(
      `${SERVER_URL}/api/users/${id}/student-details`,
      { [type]: updated },
      { withCredentials: true },
    );
  } catch (error) {
    console.log(`Update ${type} preferences error: ${error}`);
  }
};
