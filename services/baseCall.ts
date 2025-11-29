import axios from "axios";
import Constants from "expo-constants";
import { getItem } from "./secureStore";
import { useState } from "react";
// Adicione o "/legacy" no final
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';
import { RESTRICTION_IDS } from "../enum/profileEnum";

const back_url = "http://192.168.1.105:3000/api";

export async function baseFetch(route: string) {
  try {
    const result = await axios.get(`${back_url}${route}`)
    if (result.status === 200 || result.status === 201)
      return result;
  } catch (err: any) {

    console.log('Erro na chamada:', err.message)
    return
  }
}
export async function basePost(route: string, data: any) {
  try {
    const result = await axios.post(`${back_url}/${route}`, data);
    if (result.status === 200 || result.status === 201) {
      console.log('deu certo')
      return result;
    }
  }
  catch (err) {
    console.log('ERRO NO BASEPOST', err)
  }
}

export async function baseValidate() {

  const token = await getItem('token');
  try {
    const result = await axios.post(
      `${back_url}/auth/validateToken`,
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

  console.log(`ROTA: ${back_url}/${route}/${id}`)

  try {
    const fetchData = await axios.get(`${back_url}/${route}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Fetched data: ", fetchData.data);
    return fetchData;
  } catch (err: any) {
    console.log("Erro ao buscar dados:", err.message);
  }
}

export async function basePutUnique(route: string, data: any) {

  const token = await getItem('token');
  const id = await getItem('id');
  try {
    console.log("Data: ", data);
    const putData = await axios.put(`${back_url}/${route}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return putData;
  } catch (err: any) {
    console.log("Erro ao atualizar dados:", err.message);
  }
}

export async function basePutMultidata(route: string, imageUri: string) {
  const token = await getItem('token');
  const url = `${back_url}/${route}`;

  try {
    const response = await uploadAsync(url, imageUri, {
      fieldName: 'profilePicture',
      httpMethod: 'PUT',
      uploadType: FileSystemUploadType.MULTIPART, // Usando o Enum do legacy
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

export async function baseDelete(route: string, data: any) {
  const token = await getItem('token');
  const url = `${back_url}/${route}`.replace(/([^:]\/)\/+/g, "$1");

  try {
    console.log(`DELETE: ${url}`, JSON.stringify(data)); // Confirme o JSON aqui

    const response = await axios.delete(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: data
    });

    return response;
  } catch (err: any) {
    console.log("Erro no DELETE:", err.response?.data || err.message);
    throw err;
  }
}