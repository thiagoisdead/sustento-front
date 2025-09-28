import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants'
import { getItem } from '../../services/getSecureStore';
import { User } from '../../types/type';
import { Avatar, Surface } from 'react-native-paper';
import HealthyPNG from '../../assets/rodrigo.jpg';


export default function Home() {
  const back_url_thiago = Constants.expoConfig?.extra?.backUrlThiago;
  const [userData, setUserData] = useState<User>()

  const fieldsSurface = [
    { label: 'Peso', value: userData?.weight },
    { label: 'Gênero', value: userData?.gender },
    { label: 'Altura', value: userData?.height },
    { label: 'Atividade Física', value: userData?.activity_lvl },
    { label: 'Objetivo', value: userData?.objective },
    { label: 'Restrições', value: userData?.restrictions },
  ]

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
      <View style={styles.firstRow}>
        <View style={styles.icon}>
          <Avatar.Image size={100} source={HealthyPNG}></Avatar.Image>
        </View>
        <View style={styles.textsFirstRow}>
          <Text>{userData?.name}</Text>
          <Text>{userData?.age} Anos</Text>
        </View>
      </View>

      <View style={styles.surfaceTexts}>
        {fieldsSurface.map((field, index) => (
          <Surface key={index} elevation={4} style={styles.surfaceItem}>
            <Text>{field.label}: {field.value}</Text>
          </Surface>
        ))}
      </View>
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
  firstRow: {
    height: '20%',
    width: '100%',
    padding: 5,
    flexDirection: 'row',
    marginVertical: 50,
  },
  icon: {
    width: '35%',
    height: '100%',
    marginHorizontal: 20,
  },
  textsFirstRow: {
    width: '65%',
    height: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  surfaceTexts: {
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  surfaceItem: {
    width: '48%',
    padding: 10,
    borderRadius: 10,
    borderStartColor: '#578f1a',
    borderStartWidth: 10,
  },
});
