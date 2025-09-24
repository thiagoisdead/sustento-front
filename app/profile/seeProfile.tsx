import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants'
import { getItem } from '../../services/getSecureStore';
import { User } from '../../types/type';

export default function Home() {
  const back_url_thiago = Constants.expoConfig?.extra?.backUrlThiago;

  const [userData, setUserData] = useState<User>()

  useEffect(() => {
    const fetchData = async () => {
      const id = await getItem('id');
      const token = await getItem('token');
      try {
        const fetchUser = await axios.get(`${back_url_thiago}/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(fetchUser.data)
        setUserData(fetchUser.data)
      }
      catch (err) {
        console.log(err)
      }
    }
    fetchData()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20 }}>Dados de Perfil</Text>
      <Text style={{ fontSize: 20 }}>Dados de Perfil</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ece1c3',
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
