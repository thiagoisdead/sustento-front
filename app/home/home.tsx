import { StyleSheet, View } from 'react-native';
import { usePath } from '../../hooks/usePath';
import QuestionaryScreen from '../../components/animatedQuestionary';
import { useEffect, useState } from 'react';
import { getItem } from '../../services/secureStore';

export default function Home() {
  const handlePath = usePath()

  const [bool, setBool] = useState<boolean>(true)

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const token = await getItem('token')
  //     if (token) {
  //       handlePath('/profile/seeProfile')
  //     }
  //     else {
  //       handlePath('/auth')
  //     }
  //     setBool(true)
  //   }
  //   fetchData()
  // }, [])


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
