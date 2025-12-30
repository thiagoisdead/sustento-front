import { useState } from 'react';
import { useWindowDimensions, StyleSheet, Text, View, Pressable } from 'react-native'; // Adicionado Pressable
import { useFonts, EpundaSlab_400Regular } from "@expo-google-fonts/epunda-slab";
import { Button, TextInput } from 'react-native-paper';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Login, loginSchema } from '../../types/auth';
import { basePost } from '../../services/baseCall';
import { usePath } from '../../hooks/usePath';
import { setItem } from '../../services/secureStore';
import { Vibration } from 'react-native';



export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  Vibration.vibrate(50);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const vw = (value: number) => (width * value) / 100;

  const handlePath = usePath();

  const [passwordSee, setPasswordSee] = useState<Boolean>();
  const [dados, setDados] = useState<Login>({
    password: "",
    email: "",
  });

  const primaryColor = "rgba(87, 143, 26, 255)"; // Extraí a cor para reutilizar

  const textInputStyle = {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    elevation: 10,
  };
  const textInputTheme = {
    roundness: 10,
    colors: {
      primary: primaryColor,
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

  const handleLogin = async () => {
    try {
      setLoading(true);
      const loginValidate = loginSchema.parse(dados);
      const responseLogin = await basePost('auth/login', loginValidate);

      if (responseLogin?.status === 200 || responseLogin?.status === 201) {
        await setItem("token", String(responseLogin?.data?.token));
        await setItem("id", String(responseLogin?.data?.id));
        handlePath('/home/home');
      }
    } catch (err: any) {
      if (err?.errors) {
        const fieldErrors: any = {};
        err.errors.forEach((e: any) => {
          fieldErrors[e.path[0]] = e.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    handlePath('/auth/recovery');
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
            onPress={() => handlePath('/auth/')}
          >
            Voltar
          </Button>
        </View>
        <View style={{ flex: 1, width: '100%', marginTop: 40, alignContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: "EpundaSlab_400Regular", fontSize: 40 }}>Sustento</Text>
        </View>
        <View style={{ width: '100%', flex: 1, flexDirection: 'column', justifyContent: 'flex-start' }}>
          <View style={{ width: vw(90), gap: 10, padding: 20, marginLeft: "auto", marginRight: "auto" }}>
            <TextInput
              label="Email"
              mode="outlined"
              value={dados?.email || ""}
              underlineColor="transparent"
              onChangeText={(text) => setDados({ ...dados, email: text })}
              style={textInputStyle}
              theme={textInputTheme}
            />
            {errors.email && (
              <Text style={{ color: '#dc2626', fontSize: 12 }}>
                {errors.email}
              </Text>
            )}

            <View>
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

              <View style={styles.forgotPasswordContainer}>
                <Pressable
                  onPress={handleForgotPassword}
                  android_ripple={{ color: '#e5e7eb' }}
                >
                  <Text style={[styles.forgotPasswordText, { color: primaryColor }]}>
                    Esqueci minha senha
                  </Text>
                </Pressable>
              </View>
            </View>

          </View>
        </View>
        <View style={{ width: '100%', height: '15%', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            mode="contained"
            style={{ width: 200 }}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Login'}
          </Button>
        </View>
      </View>
    </KeyboardAwareScrollView >
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 100
  },
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-start', // Alinha à esquerda
    marginTop: 10,
    marginLeft: 10
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  }
});