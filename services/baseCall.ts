import axios from "axios";
import Constants from "expo-constants";
import { getItem } from "./secureStore";
import { useState } from "react";
// Adicione o "/legacy" no final
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';

const back_url_thiago = "http://192.168.1.105:3000/api";

// const token = await getItem('token');
// const id = await getItem('id');

export async function baseFetch(route: string) {

  const token = await getItem('token');
  const id = await getItem('id');

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

  const token = await getItem('token');
  const id = await getItem('id');

  try {
    console.log(`${back_url_thiago}${route}`)
    console.log(data)
    const result = await axios.post(`${back_url_thiago}/${route}`, data)
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
  const id = await getItem('id');
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

  console.log(`ROTA: ${back_url_thiago}/${route}/${id}`)

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

export async function basePutUnique(route: string, data: any) {

  const token = await getItem('token');
  const id = await getItem('id');
  try {
    const putData = await axios.put(`${back_url_thiago}/${route}/${id}`, data, {
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
  const url = `${back_url_thiago}${route}`;

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