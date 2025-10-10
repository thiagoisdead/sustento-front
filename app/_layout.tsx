import { Stack, usePathname } from "expo-router";
import { PaperProvider, DefaultTheme } from "react-native-paper";
import NavBar from "../components/navbar";
import { View } from "react-native";
import { useEffect } from "react";
import { baseValidate } from "../services/baseCall";
import { getItem } from "../services/secureStore";
import { usePath } from "../hooks/usePath";

export default function RootLayout() {

  const pathname = usePathname()
  const handlePath = usePath();

  const hideNavBar = ["/auth/login", "/auth/register", "/auth"]
  const showNavbar = !hideNavBar.includes(pathname);

  useEffect(() => {
    console.log('mudei de rota', pathname)

    const fetchData = async () => {
      const token = await getItem('token')
      if (!token) return;

      try {
        const verifyToken = await baseValidate()
        if (!verifyToken.valid && !hideNavBar.includes(pathname)) handlePath('/auth')
      }
      catch (err) {
        console.log('qual erro:', err)
      }
    }
    fetchData()
  }, [pathname])


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
