import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { usePath } from '../../hooks/usePath';
import QuestionaryScreen from '../../components/animatedQuestionary';
import { useEffect, useState } from 'react';
import { getItem } from '../../services/secureStore';

export default function Home() {
  const handlePath = usePath();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getItem('token');

        if (token) {
          handlePath('/calendar/seeCalendar');
        } else {
          handlePath('/auth');
        }
      } catch (error) {
        console.error("Auth check failed", error);
        handlePath('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#A8D5BA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <QuestionaryScreen />
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