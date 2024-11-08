import axios from "axios";
import { SERVER_URL } from "./constants";

export const getPreferences = async (id: string, type: string) => {
  try {
    if (id === null) return {};
    const res = await axios.get(`${SERVER_URL}/api/students/${type}/${id}`, {
      withCredentials: true,
    });
    return type === "exclusions" ? res.data[0].exclusions : res.data[type];
  } catch (error) {
    console.log(`Get ${type} preferences error: ${error}`);
  }
};

export const updatePreferences = async (
  id: string,
  type: string,
  updated: object,
) => {
  try {
    await axios.put(`${SERVER_URL}/api/students/${type}/${id}`, updated, {
      withCredentials: true,
    });
  } catch (error) {
    console.log(`Update ${type} preferences error: ${error}`);
  }
};
