import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';


export default function Home() {
  const router = useRouter()
  return (
    <View style={styles.container}>
      <Button onPress={() => router.push('auth/login')}>eqweq</Button>
      <Text>!!!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ece1c3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
