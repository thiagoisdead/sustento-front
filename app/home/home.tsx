import { StyleSheet, View } from 'react-native';
import QuestionaryScreen from '../../components/animatedQuestionary';

export default function Home() {
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