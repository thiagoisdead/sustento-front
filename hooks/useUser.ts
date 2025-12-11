import { useEffect, useState } from "react";
import { baseUniqueGet } from "../services/baseCall";
import { getItem } from "../services/secureStore";

export function useUser() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true); // Começa true

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const [id, token] = await Promise.all([
          getItem("id"),
          getItem("token")
        ]);

        if (!id || !token) {
          if (mounted) {
            setUserData(null);
            setLoading(false);
          }
          return;
        }

        // NÃO defina loading false aqui. Espere o fetch.

        const response = await baseUniqueGet("users");

        if (mounted) {
          setUserData(response?.data ?? null);
        }
      } catch (err) {
        console.log(err ?? "Erro ao buscar usuário");
        if (mounted) setUserData(null);
      } finally {
        // O finally garante que o loading pare independente de sucesso ou erro
        if (mounted) setLoading(false);
      }
    };

    fetchUser();
    return () => { mounted = false; };
  }, []);

  return { userData, loading };
}
