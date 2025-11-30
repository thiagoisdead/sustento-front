import { StyleSheet, View } from 'react-native';
import { usePath } from '../../hooks/usePath';
import QuestionaryScreen from '../../components/animatedQuestionary';
import { useEffect, useState } from 'react';
import { getItem } from '../../services/secureStore';
import { baseUniqueGet } from '../../services/baseCall';

export default function Home() {
  const handlePath = usePath()

  const [bool, setBool] = useState<boolean>(true)
  const [userData, setUserData] = useState<any>(null);

useEffect(() => {
  const fetchData = async () => {
    const token = await getItem('token')
    const response = await baseUniqueGet('users');
    console.log('response', response.data)

    if (!token) {
      handlePath('/auth')
      return; // interrompe a execução do restante
    }

    if (!response?.data?.gender) {
      setBool(true)
      // aqui você pode escolher não redirecionar ainda
      return; // se quiser parar aqui
    }

    handlePath('/profile/seeProfile')
  }
  fetchData()
}, [])



  return (
    <View style={styles.container}>
      {bool && (
        <QuestionaryScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
