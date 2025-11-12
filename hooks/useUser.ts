import { useEffect, useState } from "react";
import { baseUniqueGet } from "../services/baseCall";
import { getItem } from "../services/secureStore";

export function useUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const id = await getItem("id");
        const token = await getItem("token");

        if (!id || !token) {
          throw new Error("ID ou token não encontrados.");
        }

        const response = await baseUniqueGet(`users`);

        if (response) setUser(response.data);
      } catch (err: any) {
        console.log(err.message ?? "Erro ao buscar usuário");
      }
    };

    fetchUser();
  }, []);

  return user
}
