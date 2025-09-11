import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useFonts, EpundaSlab_400Regular } from "@expo-google-fonts/epunda-slab";
import { Button, TextInput } from 'react-native-paper';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Login } from '../../types/type';

export default function Register() {

  const router = useRouter()
  const handleChange = () => {
    if (!dados) return
  }


  const [dados, setDados] = useState<Login>({
    password: "",
    email: "",
  });
  const [passwordSee, setPasswordSee] = useState<Boolean>();



  const textInputStyle = {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    elevation: 10,
  };
  const textInputTheme = {
    roundness: 10,
    colors: {
      primary: "rgba(87, 143, 26, 255)",
      outline: "transparent",
      background: "transparent",
      onSurfaceVariant: "#0d0c22",
    },
  };


  const [fontsLoaded] = useFonts({
    EpundaSlab_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={10}>
      <View style={styles.container}>
        <View style={{ height: '15%', width: '100%', paddingHorizontal: 10, display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <Button
            icon="arrow-left"
            mode="contained"
            onPress={() => router.push('/register-login/')}
          >
            Voltar
          </Button>
        </View>
        <View style={{ flex: 1, width: '100%',  marginTop: 40, alignContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: "EpundaSlab_400Regular", fontSize: 40 }}>Sustento</Text>
        </View>
        <View style={{ width: '100%', flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }}>
          <View style={{ width: '100%', gap: 10, padding: 20 }}>
            <TextInput
              label="Email"
              mode="outlined"
              value={dados?.email || ""}
              underlineColor="transparent"
              onChangeText={(text) => setDados({ ...dados, email: text })}
              style={textInputStyle}
              theme={textInputTheme}
            />
            <TextInput
              label="Senha"
              mode="outlined"
              value={dados?.password || ""}
              underlineColor="transparent"
              onChangeText={(text) => setDados({ ...dados, password: text })}
              style={textInputStyle}
              theme={textInputTheme}
              secureTextEntry={!passwordSee}
              right={
                <TextInput.Icon forceTextInputFocus={false} icon={passwordSee ? 'eye-off' : 'eye'} onPress={() => setPasswordSee(!passwordSee)} />
              }
            />
          </View>
        </View>
        <View style={{ width: '100%', height: '15%', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button mode='contained' style={{ width: 200 }}>
            Login
          </Button>
        </View>
      </View>
    </KeyboardAwareScrollView>
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
