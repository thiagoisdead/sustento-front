import { Stack, usePathname } from "expo-router";
import { PaperProvider, DefaultTheme } from "react-native-paper";
import * as Animatable from 'react-native-animatable';
import NavBar from "../components/navbar";
import { View } from "react-native";

export default function RootLayout() {
  const pathname = usePathname()

  console.log(pathname)

  const hideNavBar = ["/auth/login", "/auth/register", "/auth"]
  const showNavbar = !hideNavBar.includes(pathname);

  console.log(showNavbar)

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#578f1a',
      onPrimary: "white",
    }
  }

  return (
    <PaperProvider theme={theme}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: showNavbar ? 0.85 : 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>

        {showNavbar && (
          <View style={{ flex: 0.15, justifyContent: 'center', backgroundColor: '#1a2323' }}>
            <NavBar />
          </View>
        )}
      </View >
    </PaperProvider>
  );
}
