import { useState } from 'react';
import { useWindowDimensions, StyleSheet, Text, View } from 'react-native';
import { useFonts, EpundaSlab_400Regular } from "@expo-google-fonts/epunda-slab";
import { Button, TextInput, HelperText } from 'react-native-paper';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { usePath } from '../../hooks/usePath';
import { basePost } from '../../services/baseCall';

export default function RecoveryScreen() {
  const { width } = useWindowDimensions();
  const vw = (value: number) => (width * value) / 100;
  const handlePath = usePath();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false); // Controla se mostra o form ou a mensagem de sucesso
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

  if (!fontsLoaded) {
    return null;
  }

  const validateEmail = (emailToValidate: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  };

  const handleRecovery = async () => {
    setError("");
    
    if (!email) {
      setError("Por favor, digite seu email.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Digite um email válido.");
      return;
    }

    setLoading(true);
    await basePost('auth/requestPasswordReset', { email });
    setTimeout(() => {
      setLoading(false);
      setIsSent(true); // Troca a tela para "Sucesso"
    }, 1500);
  };

  return (
    <KeyboardAwareScrollView 
      style={{ flex: 1 }} 
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={10}
    >
      <View style={styles.container}>
        
        {/* HEADER / VOLTAR */}
        <View style={styles.headerContainer}>
          <Button
            icon="arrow-left"
            mode="contained"
            buttonColor={primaryColor}
            onPress={() => handlePath('/auth/login')} // Volta pro Login
          >
            Voltar
          </Button>
        </View>

        <View style={styles.contentContainer}>
          <Text style={{ fontFamily: "EpundaSlab_400Regular", fontSize: 32, marginBottom: 20 }}>
            Recuperar Senha
          </Text>

          {/* RENDERIZAÇÃO CONDICIONAL: Form ou Sucesso */}
          {!isSent ? (
            // --- ESTADO 1: FORMULÁRIO ---
            <View style={{ width: vw(90), gap: 10, padding: 20 }}>
              <Text style={styles.instructionText}>
                Informe o email associado à sua conta para receber o token de redefinição.
              </Text>

              <TextInput
                label="Email"
                mode="outlined"
                value={email}
                underlineColor="transparent"
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
                style={textInputStyle}
                theme={textInputTheme}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!error}
              />
              
              {!!error && (
                <HelperText type="error" visible={!!error}>
                  {error}
                </HelperText>
              )}

              <Button 
                mode='contained' 
                style={{ marginTop: 20 }} 
                buttonColor={primaryColor}
                onPress={handleRecovery}
                loading={loading}
                disabled={loading}
              >
                Recuperar Senha
              </Button>
            </View>
          ) : (
            <View style={styles.successContainer}>
              <MaterialCommunityIcons name="email-check-outline" size={80} color={primaryColor} />
              
              <Text style={styles.successTitle}>Email Enviado!</Text>
              
              <Text style={styles.successText}>
                Foi enviado no seu email ({email}) um token para definir uma nova senha!
              </Text>
              
              <Text style={styles.successSubText}>
                Verifique sua caixa de entrada e spam.
              </Text>

              {/* <Button 
                mode='contained' 
                style={{ marginTop: 30, width: 200 }} 
                buttonColor={primaryColor}
                onPress={() => handlePath('/auth/login')}
              >
                Voltar ao Login
              </Button> */}
            </View>
          )}
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
    paddingVertical: 60
  },
  headerContainer: {
    height: '10%', 
    width: '100%', 
    paddingHorizontal: 20, 
    justifyContent: 'center', 
    alignItems: 'flex-start'
  },
  contentContainer: {
    flex: 1, 
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 60
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20
  },
  // Estilos da tela de sucesso
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 20
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
    lineHeight: 22
  },
  successSubText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic'
  }
});