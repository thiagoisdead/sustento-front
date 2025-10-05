import axios from "axios";
import Constants from "expo-constants";
import { getItem } from "./secureStore";


const back_url_thiago = Constants.expoConfig?.extra?.backUrlThiago;

export async function baseFetch(route: string) {

  try {

    const result = await axios.get(`${back_url_thiago}${route}`)

    if (result.status === 200 || result.status === 201)
      return result;
  } catch (err: any) {

    console.log('Erro na chamada:', err.message)
    return
  }
}
export async function basePost(route: string, data: any) {

  try {
    console.log(`${back_url_thiago}/${route}`)
    const result = await axios.post(`${back_url_thiago}${route}`, data)
    if (result.status === 200 || result.status === 201) {
      console.log('deu certo')
      return result;
    }
  }
  catch (err) {
    console.log('ERRO NO BASEPOST', err)
  }
}

export async function baseValidate(token: string) {
  try {
    const result = await axios.post(
      `${back_url_thiago}/auth/validateToken`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return result.data;
  } catch (err: any) {
    console.log("Erro ao validar token:", err.response?.data || err.message);
    throw err;
  }
}
export async function baseUniqueGet(route: string) {

  const token = await getItem('token');
  const id = await getItem('id');

  try {
    const fetchData = await axios.get(`${back_url_thiago}/${route}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return fetchData;
  } catch (err: any) {
    console.log("Erro ao buscar dados:", err.message);
  }
}