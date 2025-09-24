import * as SecureStore from 'expo-secure-store';


export async function getItem(key: string) {
  try {
    return await SecureStore.getItemAsync(key)
  }
  catch (err) {
    console.error("Erro ao obter o item:", err);
    return null
  }
}