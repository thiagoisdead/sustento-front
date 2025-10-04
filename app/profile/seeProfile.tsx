import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import { getItem } from '../../services/secureStore';
import { User, userSchema } from '../../types/type';
import { Avatar, Surface } from 'react-native-paper';
import HealthyPNG from "../../assets/rodrigo.jpg"
import { usePath } from '../../hooks/usePath';

export default function Home() {
  const back_url = Constants.expoConfig?.extra?.backUrl;
  const [userData, setUserData] = useState<User>({
    active_plan_id: null,
    activity_lvl: null,
    age: null,
    created_at: "",
    email: "",
    gender: null,
    height: null,
    bmi: null,
    name: "",
    objective: null,
    updated_at: "",
    user_id: "",
    weight: null,
    restrictions: null,
  });
  const handlePath = usePath();

  const fieldsSurface = [
    { label: 'Peso', value: userData?.weight, large: false },
    { label: 'Altura', value: userData?.height, large: false },
    { label: 'Gênero', value: userData?.gender, large: false },
    { label: 'Imc', value: userData?.bmi, large: false },
    { label: 'Atividade Física', value: userData?.activity_lvl, large: true },
    { label: 'Objetivo', value: userData?.objective, large: true },
    { label: 'Restrições', value: userData?.restrictions, large: true },
    { label: 'Email', value: userData?.email, large: true },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const id = await getItem('id');
      const token = await getItem('token');
      console.log(`${back_url}/users/${id}`);
      try {
        const fetchUser = await axios.get(`${back_url}/users/1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(fetchUser.data);
        const validatedUser = userSchema.parse(fetchUser.data);
        setUserData(validatedUser);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const goToEditProfilePage = () => {
    handlePath('/profile/editProfile');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#ece1c3' }}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Dados de Perfil</Text>

      <View style={styles.firstRow}>
        <View style={styles.icon}>
          <Avatar.Image size={100} source={HealthyPNG} />
        </View>
        <View style={styles.textsFirstRow}>
          <Text style={styles.name}>{userData?.name ? userData.name : "Não informado"}</Text>
          <Text style={styles.age}>{userData?.age ? userData.name : "Não informado"} Anos</Text>
        </View>
      </View>
      <View style={styles.surfaceTexts}>
        {fieldsSurface.map((field, index) => {
          if (field.value == "Gênero") {
            console.log("Genre.");
          }

          return (
            <Surface
              key={index}
              style={field.large ? styles.surfaceItemLarge : styles.surfaceItem}
            >
              <Text style={styles.surfaceLabel}>{field.label}</Text>
              <Text style={styles.surfaceValue}>{field.value}</Text>
            </Surface>
          )
        })}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.btnBase,
          pressed && styles.btnPressed,
        ]}
        onPress={goToEditProfilePage}
      >
        <Text style={styles.btnText}>Editar perfil</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: "F5F5DC",
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 10,
  },
  firstRow: {
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    marginVertical: 30,
    alignItems: 'center',
  },
  icon: {
    width: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textsFirstRow: {
    width: '65%',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  age: {
    fontSize: 16,
    color: '#616161',
  },
  surfaceTexts: {
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  surfaceItem: {
    width: '48%',
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderStartColor: '#2E7D32',
    borderStartWidth: 6,
  },
  surfaceItemLarge: {
    width: '100%',
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderStartColor: '#2E7D32',
    borderStartWidth: 6,
  },
  surfaceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  surfaceValue: {
    fontSize: 16,
    color: '#212121',
  },
  btnBase: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  btnPressed: {
    backgroundColor: '#1B5E20',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
