import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Healthy from "../../assets/svgs/breakfast.svg"
import { useFonts, EpundaSlab_400Regular } from "@expo-google-fonts/epunda-slab";
import { Button } from 'react-native-paper';

export default function RegisterHome() {

  const router = useRouter()
  const [fontsLoaded] = useFonts({
    EpundaSlab_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={{ height: '20%', marginTop: -20 }}>
        <Text style={{ fontFamily: "EpundaSlab_400Regular", fontSize: 40 }}>Sustento</Text>
      </View>
      <View style={{ width: '100%', height: '50%' }}>
        <Healthy></Healthy>
      </View>
      <View style={{ height: '25%', justifyContent: 'space-around', alignItems: 'flex-end', flexDirection: 'row', gap: 10 }}>
        <View style={{ padding: 20 }}>
          <Button mode='contained' labelStyle={{ fontSize: 15 }} onPress={() => router.push('/auth/login')}>
            Login
          </Button>
        </View>
        <View style={{ padding: 20 }} >
          <Button mode='contained' labelStyle={{ fontSize: 15 }} onPress={() => router.push('/auth/register')}>
            Registre-se
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    // backgroundColor: 'blue',
    paddingVertical: 100

  },
});
