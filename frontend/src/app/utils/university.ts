import { useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "./constants";
import { University } from "@/types/users";

export const useUniversities = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get<{ allUnis: University[] }>(
          `${SERVER_URL}/api/users/universities`,
        );
        setUniversities(data.allUnis);
        setError(null);
      } catch (err) {
        console.error("Error fetching universities:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { universities, loading, error };
};

export const useSites = () => {
  return {
    universities: [
      { id: 1, name: "University of New South Wales", hostedAt: 1 },
      { id: 43, name: "University of the South Pacific", hostedAt: 43 },
    ],
  };
};

export const universityToSiteId = async (university: string) => {
  try {
    const res = await axios.get(`${SERVER_URL}/api/users/universities`, {
      withCredentials: true,
    });
    const { allUnis } = res.data;
    console.log(allUnis);
    const givenUni = allUnis.find((u: University) => u.name === university);
    console.log(givenUni);
    return givenUni.hostedAt;
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
