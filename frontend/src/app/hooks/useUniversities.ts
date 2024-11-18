import { useState, useEffect } from "react";
import axios from "axios";
import { University } from "@/types/users";
import { SERVER_URL } from "@/utils/constants";

const useUniversities = () => {
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

export default useUniversities;
