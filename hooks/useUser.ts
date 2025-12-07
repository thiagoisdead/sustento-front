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
        // 🔥 libera a UI rapidamente
        const [id, token] = await Promise.all([
          getItem("id"),
          getItem("token")
        ]);

        if (!id || !token) {
          if (mounted) {
            setUserData(null);
            setLoading(false); // libera UI imediatamente
          }
          return;
        }

        // 🔥 deixa a UI carregando só o conteúdo, não o app inteiro
        setLoading(false);

        const response = await baseUniqueGet("users");
        if (mounted) {
          setUserData(response?.data ?? null);
        }

      } catch (err) {
        console.log(err ?? "Erro ao buscar usuário");
        if (mounted) {
          setUserData(null);
          setLoading(false);
        }
      }
    };

    fetchUser();
    return () => { mounted = false; };
  }, []);

  return { userData, loading };
}

