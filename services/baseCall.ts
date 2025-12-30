import axios from "axios";
import { getItem, removeItem } from "./secureStore";
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';
import Constants from 'expo-constants';

const API_URL: string = Constants.expoConfig?.extra?.backUrl;

const cleanUrl = (route: string) => `${API_URL}/${route}`.replace(/([^:]\/)\/+/g, "$1");

export async function baseValidate(handlePath?: (path: string) => void) {
  const token = await getItem('token');

  try {
    const result = await axios.post(
      `${API_URL}/auth/validateToken`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return result.data;
  } catch (err: any) {
    if (err.response?.data?.error === "Invalid or expired token") {
      await removeItem('token');
      handlePath?.('/auth');
    }
    else throw err;
  }
}

export async function baseFetch(route: string) {

  const token = await getItem('token');
  try {
    const result = await axios.get(cleanUrl(route), {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (result.status === 200 || result.status === 201) return result;
  } catch (err: any) {
    console.log('Erro no GET:', err.message);
  }
}

export async function baseUniqueGet(route: string) {
  const token = await getItem('token');
  const id = await getItem('id');



  try {
    const url = cleanUrl(`${route}/${id}`);
    const fetchData = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return fetchData;
  } catch (err: any) {
    console.log(`Erro no GET Unique com o id ${id} e a url ${cleanUrl(`${route}/${id}`)}`, err.message);
  }
}

export async function baseGetById(route: string, id: number) {
  const token = await getItem('token');
  try {
    const url = cleanUrl(`${route}/${id}`);
    const result = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return result;
  } catch (err: any) {
    console.log(`Erro no GET ${route}/${id}:`, err.message);
    return null;
  }
}

export async function basePutUnique(route: string, data: any) {
  const token = await getItem('token');
  const id = await getItem('id');
  try {
    const url = cleanUrl(`${route}/${id}`);
    const putData = await axios.put(url, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return putData;
  } catch (err: any) {
    console.log(`Erro no PUT ${route}/${id} com o data ${JSON.stringify(data)} ou ${data}`, err.message);
  }
}

export async function basePost(route: string, data: any) {
  const token = await getItem('token');
  try {
    const result = await axios.post(cleanUrl(route), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (result.status === 200 || result.status === 201) return result;
  } catch (err: any) {
    console.log('ERRO NO POST:', err.response?.data || err.message);
    throw err;
  }
}

export async function baseDelete(route: string, params?: any) {
  const token = await getItem('token');
  const url = cleanUrl(route);

  try {
    const response = await axios.delete(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: params
    });
    return response;
  } catch (err: any) {
    console.log("Erro no DELETE:", err.response?.data || err.message);
    throw err;
  }
}

export async function baseDeleteById(route: string) {
  const token = await getItem('token');
  const url = cleanUrl(route);
  try {
    const response = await axios.delete(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response;
  } catch (err: any) {
    console.log("Erro no DELETE:", err.response?.data || err.message);
    throw err;
  }
}



export async function basePutMultidata(route: string, imageUri: string) {
  const token = await getItem('token');
  const url = cleanUrl(route);

  try {
    const response = await uploadAsync(url, imageUri, {
      fieldName: 'profilePicture',
      httpMethod: 'PUT',
      uploadType: FileSystemUploadType.MULTIPART,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return response.body ? JSON.parse(response.body) : {};
    } else {
      throw new Error(`Erro Servidor: ${response.status} - ${response.body}`);
    }
  } catch (err: any) {
    console.log('❌ FALHA NO UPLOAD:', err.message);
  }
}

export async function basePutById(route: string, id: number, data: any) {
  const token = await getItem('token');
  try {
    const url = cleanUrl(`${route}/${id}`);
    const result = await axios.put(url, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return result;
  } catch (err: any) {
    console.log(`Erro no PUT ${route}/${id}:`, err.message);
    throw err;
  }
}
export async function basePutNormal(route: string, data: any) {
  const token = await getItem('token');
  try {
    const url = cleanUrl(`${route}`);
    const result = await axios.put(url, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return result;
  } catch (err: any) {
    console.log(`Erro no PUT ${route}:`, err.message);
    throw err;
  }
}