import axios from "axios";
import { SERVER_URL } from "./constants";

export const getPreferences = async (id: string, type: string) => {
  if (!id) return undefined;
  try {
    const res = await axios.get(
      `${SERVER_URL}/api/users/${id}/student-details/${type}`,
      { withCredentials: true },
    );
    return res.data[type];
  } catch (error) {
    console.log(`Get ${type} error: ${error}`);
  }
};

export const updatePreferences = async (
  id: string,
  type: string,
  updated: string,
) => {
  if (!id) return;
  try {
    await axios.patch(
      `${SERVER_URL}/api/users/${id}/student-details`,
      { [type]: updated },
      { withCredentials: true },
    );
    return true;
  } catch (error) {
    console.log(`Update ${type} error: ${error}`);
    return false;
  }
};
