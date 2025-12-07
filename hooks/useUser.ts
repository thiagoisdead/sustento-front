import { useEffect, useState } from "react";
import { baseUniqueGet } from "../services/baseCall";
import { getItem } from "../services/secureStore";

export function useUser() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const [id, token] = await Promise.all([getItem("id"), getItem("token")]);

        if (!id || !token) {
          if (!mounted) return;
          setUserData(null);
          return;
        }

        const response = await baseUniqueGet("users");
        if (!mounted) return;
        setUserData(response?.data ?? null);
      } catch (err: any) {
        console.log(err?.message ?? "Erro ao buscar usuário");
        if (!mounted) return;
        setUserData(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  return { userData, loading };
}
