import { usePath } from "./usePath";
import { removeItem } from "../services/secureStore";

export function useLogout() {

  const handlePath = usePath();

  const logout = async () => {
    await removeItem('token');
    await removeItem('id');
    handlePath('/auth');
  };
  return logout
}