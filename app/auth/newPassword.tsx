import { useState, useEffect } from 'react';
import { useWindowDimensions, StyleSheet, Text, View, Alert } from 'react-native';
import { useFonts, EpundaSlab_400Regular } from "@expo-google-fonts/epunda-slab";
import { Button, TextInput, HelperText } from 'react-native-paper';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useLocalSearchParams } from 'expo-router'; // <--- O SEGREDO ESTÁ AQUI
import { usePath } from '../../hooks/usePath';
import { basePost } from '../../services/baseCall';

export default function NewPasswordScreen() {
  const { width } = useWindowDimensions();
  const vw = (value: number) => (width * value) / 100;
  const handlePath = usePath();
  
  // Captura o token da URL (ex: sustento://auth/new-password?token=123)
  const { token } = useLocalSearchParams(); 

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSee, setPasswordSee] = useState(false);
  const [confirmPasswordSee, setConfirmPasswordSee] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const primaryColor = "rgba(87, 143, 26, 255)";

  const [fontsLoaded] = useFonts({
    EpundaSlab_400Regular,
  });

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

  // Bloqueia se não tiver token (segurança extra visual)
  useEffect(() => {
    if (!token) {
      Alert.alert("Erro", "Link inválido ou expirado.", [
        { text: "Voltar ao Login", onPress: () => handlePath('/auth/login') }
      ]);
    }
  }, [token]);

  if (!fontsLoaded) return null;

  const handleResetPassword = async () => {
    setError("");

    if (!password || !confirmPassword) {
      setError("Preencha ambos os campos.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!token) {
        setError("Token de autorização não encontrado.");
        return;
    }

    setLoading(true);

    try {
        const response = await basePost('auth/resetPassword', { 
            token: token, 
            newPassword: password 
        });

        Alert.alert("Sucesso", "Sua senha foi redefinida!", [
            { text: "Fazer Login", onPress: () => handlePath('/auth/login') }
        ]);
    } catch (err) {
        setError("Não foi possível redefinir a senha. Tente solicitar um novo link.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView 
      style={{ flex: 1 }} 
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={10}
    >
      <View style={styles.container}>
        
        {/* LOGO SUSTENTO */}
        <View style={styles.logoContainer}>
          <Text style={{ fontFamily: "EpundaSlab_400Regular", fontSize: 40 }}>Sustento</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={{ fontFamily: "EpundaSlab_400Regular", fontSize: 32, marginBottom: 20 }}>
            Nova Senha
          </Text>

          <View style={{ width: vw(90), gap: 15, padding: 20 }}>
            <Text style={styles.instructionText}>
              Crie uma senha forte para proteger sua conta.
            </Text>

            {/* SENHA */}
            <TextInput
              label="Nova Senha"
              mode="outlined"
              value={password}
              underlineColor="transparent"
              onChangeText={(text) => {
                setPassword(text);
                setError("");
              }}
              style={textInputStyle}
              theme={textInputTheme}
              secureTextEntry={!passwordSee}
              right={
                <TextInput.Icon 
                  icon={passwordSee ? 'eye-off' : 'eye'} 
                  onPress={() => setPasswordSee(!passwordSee)} 
                />
              }
            />

            {/* CONFIRMAR SENHA */}
            <TextInput
              label="Confirmar Senha"
              mode="outlined"
              value={confirmPassword}
              underlineColor="transparent"
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError("");
              }}
              style={textInputStyle}
              theme={textInputTheme}
              secureTextEntry={!confirmPasswordSee}
              right={
                <TextInput.Icon 
                  icon={confirmPasswordSee ? 'eye-off' : 'eye'} 
                  onPress={() => setConfirmPasswordSee(!confirmPasswordSee)} 
                />
              }
            />
            
            {!!error && (
              <HelperText type="error" visible={!!error} style={{ fontSize: 14 }}>
                {error}
              </HelperText>
            )}

            <Button 
              mode='contained' 
              style={{ marginTop: 20 }} 
              buttonColor={primaryColor}
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading}
            >
              Redefinir Senha
            </Button>
          </View>
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
    justifyContent: 'center',
    paddingVertical: 20
  },
  logoContainer: {
    width: '100%', 
    alignItems: 'center', 
    marginTop: 40,
    marginBottom: 10
  },
  contentContainer: {
    flex: 1, 
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'flex-start'
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20
  },
});