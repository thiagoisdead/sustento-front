import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useFonts, EpundaSlab_400Regular } from "@expo-google-fonts/epunda-slab";
import { Button, TextInput } from 'react-native-paper';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Registro, registerSchema } from '../../types/auth';
import Constants from "expo-constants";
import { removeItem, setItem } from '../../services/secureStore';
import { usePath } from '../../hooks/usePath';
import { basePost } from '../../services/baseCall';


export default function Register() {

  const handlePath = usePath();

  const { width, height } = useWindowDimensions();

  const vw = (value: number) => (width * value) / 100;

  const [dados, setDados] = useState<Registro>({
    name: "",
    password: "",
    email: "",
    confirmPassword: "",
  });
  const [passwordSee, setPasswordSee] = useState<boolean>();
  const [passwordConfirmationSee, setPasswordConfirmationSee] = useState<boolean>();

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

  const handleRegister = async () => {

    await removeItem('token')
    if (dados.password !== dados?.confirmPassword) return
    const { confirmPassword, ...dataRegister } = dados;

    try {
      const registerValidate = registerSchema.parse(dados)

      const responseRegister = await basePost('/auth/register', registerValidate);
      if (responseRegister && responseRegister.status === 201) {
        const { name, ...dataLogin } = dataRegister;
        try {
          const responseLogin = await basePost('/auth/login', dataLogin)
          await setItem("token", responseLogin?.data?.token)
          const userId = String(responseLogin?.data?.id) as string;
          await setItem("id", userId)
          handlePath('home')
        }
        catch (loginErr: any) {
          console.log("Erro no login:", loginErr)
        }
      }
    } catch (registerErr: any) {
      console.log("Erro ao cadastrar:", registerErr.message);
    }
  }

  return (
    <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={20}>
      <View style={styles.container}>
        <View style={{ height: '10%', width: '100%', paddingHorizontal: 10, display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <Button
            icon="arrow-left"
            mode="contained"
            onPress={() => handlePath('/auth/')}
          >
            Voltar
          </Button>
        </View>
        <View style={{ height: '10%', marginTop: 40 }}>
          <Text style={{ fontFamily: "EpundaSlab_400Regular", fontSize: 40 }}>Sustento</Text>
        </View>
        <View style={{ width: '100%', flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
          <View style={{ width: vw(90), gap: 10, padding: 20, marginLeft: "auto", marginRight: "auto" }}>
            <TextInput
              label="Nome"
              mode="outlined"
              value={dados?.name || ""}
              underlineColor="transparent"
              onChangeText={(text) => setDados({ ...dados, name: text })}
              style={textInputStyle}
              theme={textInputTheme}
            />
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
            <TextInput
              label="Confirme sua senha"
              mode="outlined"
              value={dados?.confirmPassword || ""}
              underlineColor="transparent"
              onChangeText={(text) => setDados({ ...dados, confirmPassword: text })}
              style={textInputStyle}
              theme={textInputTheme}
              secureTextEntry={!passwordConfirmationSee}
              right={
                <TextInput.Icon forceTextInputFocus={false} icon={passwordConfirmationSee ? 'eye-off' : 'eye'} onPress={() => setPasswordConfirmationSee(!passwordConfirmationSee)} />
              }
            />
          </View>
        </View>
        <View style={{ width: '100%', height: '15%', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button mode='contained' style={{ width: 200 }} onPress={() => handleRegister()}>
            Cadastrar
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
