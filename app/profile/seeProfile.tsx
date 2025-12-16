import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { baseUniqueGet } from '../../services/baseCall';
import { usePath } from '../../hooks/usePath';
import { useLogout } from '../../hooks/useLogout';

import { User } from '../../types/data';
import { COLORS } from '../../constants/theme';

import { AnimatedButton } from '../../components/animatedButton';
import { Header } from '../../components/profile/profileHeader';
import { ProfileAvatar } from '../../components/profile/profileAvatar';
import { ProfileField } from '../../components/profile/profileField';
import { RestrictionLabels } from '../../enum/profileEnum';
import { getItem } from '../../services/secureStore';
import { BaseButton } from '../../components/baseButton';

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
        const rawData = { ...response.data };
        rawData.age = rawData.age !== null && rawData.age !== undefined ? String(rawData.age) : "";
        setUserData(rawData);
      }
    } catch (err) {
      console.log("Error fetching user data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      <Header text="Dados de Perfil" onFunction={handleLogout} iconName="logout" />

      <ProfileAvatar
        name={userData.name}
        age={userData.age}
        pictureUrl={userData.profile_picture_url}
      />

      <View style={styles.fieldsContainer}>
        <ProfileField label="Peso" value={userData.weight} />
        <ProfileField label="Altura" value={userData.height} />
        <ProfileField label="Gênero" value={userData.gender} />
        <ProfileField label="Imc" value={userData.bmi} />

        {/* Large Fields */}
        <ProfileField label="Atividade Física" value={userData.activity_lvl} large />
        <ProfileField label="Objetivo" value={userData.objective} large />
        <ProfileField
          label="Restrições"
          value={userData.restrictions?.map(r => RestrictionLabels[r]).join(', ') || "Nenhuma"}
          large
        />
        <ProfileField label="Email" value={userData.email} large />
      </View>
      <View style={{ marginTop: 20 }}>
        <BaseButton onPress={() => handlePath('/profile/editProfile')} text="Editar perfil" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  fieldsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  btnBase: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});