import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { usePath } from '../../hooks/usePath';

export default function Home() {
  const handlePath = usePath();
  return (
    <View style={styles.container}>
      <Button onPress={() => handlePath('auth/login')}>Login</Button>
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
