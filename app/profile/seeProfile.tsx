import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Services & Hooks
import { baseUniqueGet } from '../../services/baseCall';
import { usePath } from '../../hooks/usePath';
import { useLogout } from '../../hooks/useLogout';

// Types & Constants
import { User } from '../../types/data';
import { COLORS } from '../../constants/theme';

// Components
import { AnimatedButton } from '../../components/animatedButton';
import { ProfileHeader } from '../../components/profile/profileHeader';
import { ProfileAvatar } from '../../components/profile/profileAvatar';
import { ProfileField } from '../../components/profile/profileField';
import { RestrictionLabels } from '../../enum/profileEnum';
import { SERVER_URL } from '../../constants/config';

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
        // Ensure age is string for display logic
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
      <ProfileHeader onLogout={handleLogout} />

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

      <AnimatedButton
        onPress={() => handlePath('/profile/editProfile')}
        style={styles.btnBase}
        scaleTo={0.9}
      >
        <Text style={styles.btnText}>Editar perfil</Text>
      </AnimatedButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingTop: 50,
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
    marginVertical: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});