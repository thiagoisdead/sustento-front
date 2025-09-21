import { Stack, usePathname } from "expo-router";
import { PaperProvider, DefaultTheme } from "react-native-paper";
import * as Animatable from 'react-native-animatable';
import NavBar from "../components/navbar";

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
      <Stack screenOptions={{ headerShown: false }} />
      {showNavbar && <NavBar />}
    </PaperProvider>
  );
}
