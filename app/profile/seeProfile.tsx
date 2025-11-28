import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { User, userSchema } from '../../types/data';
import { Avatar, Surface } from 'react-native-paper';
import HealthyPNG from "../../assets/rodrigo.jpg"
import { usePath } from '../../hooks/usePath';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Octicons from '@expo/vector-icons/Octicons';
import { useLogout } from '../../hooks/useLogout';
import { baseUniqueGet } from '../../services/baseCall';
import { AnimatedButton } from '../../components/animatedButton';
import { ActivityLvl, ActivityLvlLabels, Gender, GenderLabels, Objective, ObjectiveLabels } from '../../enum/profileEnum';

export default function SeeProfile() {
  const handlePath = usePath();
  const handleLogout = useLogout();

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
    user_id: 0,
    weight: null,
    restrictions: null,
    profile_picture_url: null,
  });

  const fetchData = async () => {
    try {
      const response = await baseUniqueGet('users');
      if (response) {
        // Create a copy of the data
        const rawData = { ...response.data };

        // Convert age to string for frontend usage
        rawData.age = rawData.age !== null && rawData.age !== undefined ? String(rawData.age) : "";

        // Set to state (frontend-friendly)
        setUserData(rawData);

        // Optionally, validate the original data with schema for safety
        const validatedUser = userSchema.parse(rawData);
        console.log("Validated user (backend-friendly):", validatedUser);

        console.log("Frontend-ready user:", rawData);
      }
    } catch (err) {
      console.log(err);
    }
  };



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
    fetchData();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F5F5DC' }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Octicons name="gear" size={24} color="black" />
        <Text style={styles.title}>Dados de Perfil</Text>
        <MaterialIcons name="logout" size={24} color="black" onPress={handleLogout} />
      </View>

      <View style={styles.firstRow}>
        <View style={styles.icon}>

          {/* LÓGICA DE EXIBIÇÃO DA IMAGEM */}
          <Avatar.Image
            size={100}
            source={(() => {
              if (userData?.profile_picture_url) {
                return { uri: "http://192.168.1.105:3000/" + userData.profile_picture_url };
              }

              return HealthyPNG;
            })()}
          />
        </View>
        <View style={styles.textsFirstRow}>
          <Text style={styles.name}>{userData?.name ? `${userData.name}` : "Não informado"}</Text>
          <Text style={styles.age}>{userData?.age ? `${userData?.age} Anos` : "Não informado"}</Text>
        </View>
      </View>
      <View style={styles.surfaceTexts}>
        {fieldsSurface.map((field, index) => {
          if (field.label == "Objetivo") {
            return (
              <Surface
                key={index}
                style={field.large ? styles.surfaceItemLarge : styles.surfaceItem}
              >
                <Text style={styles.surfaceLabel}>{field.label}</Text>
                <Text>
                  {field.value && ObjectiveLabels[field.value as Objective]
                    ? ObjectiveLabels[field.value as Objective]
                    : "Não informado"}
                </Text>
              </Surface>
            )
          }
          if (field.label == "Atividade Física") {
            return (
              <Surface
                key={index}
                style={field.large ? styles.surfaceItemLarge : styles.surfaceItem}
              >
                <Text style={styles.surfaceLabel}>{field.label}</Text>
                <Text>
                  {field.value && ActivityLvlLabels[field.value as ActivityLvl]
                    ? ActivityLvlLabels[field.value as ActivityLvl]
                    : "Não informado"}
                </Text>

              </Surface>
            )
          }
          if (field.label == "Gênero") {
            return (
              <Surface
                key={index}
                style={field.large ? styles.surfaceItemLarge : styles.surfaceItem}
              >
                <Text style={styles.surfaceLabel}>{field.label}</Text>
                <Text>
                  {field.value && GenderLabels[field.value as Gender]
                    ? GenderLabels[field.value as Gender]
                    : "Não informado"}
                </Text>

              </Surface>
            )
          }
          return (
            <Surface
              key={index}
              style={field.large ? styles.surfaceItemLarge : styles.surfaceItem}
            >
              <Text style={styles.surfaceLabel}>{field.label}</Text>
              <Text >{field.value}</Text>
            </Surface>
          )
        })}
      </View>
      <AnimatedButton
        onPress={() => handlePath('/profile/editProfile')}
        style={styles.btnBase} scaleTo={0.9}
      >
        <Text style={styles.btnText}>Editar perfil</Text>
      </AnimatedButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: "#F5F5DC",
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 1,
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
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderStartColor: '#2E7D32',
    borderStartWidth: 6,
  },
  surfaceItemLarge: {
    width: '100%',
    padding: 15,
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
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 25,
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
  header: {
    width: '85%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});
