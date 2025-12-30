import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { usePath } from "../../hooks/usePath";
import { useUser } from "../../hooks/useUser";
import { getItem } from "../../services/secureStore";
import { useRouter } from "expo-router";

export default function AuthGate() {

  const router = useRouter();
  const { userData, loading } = useUser();

  useEffect(() => {
    const run = async () => {
      if (loading) return;

      const token = await getItem("token");
      const id = await getItem("id");

      if (!token || !id) {
        return router.replace("/auth");
      }

      if (token && id && !userData?.activity_lvl) {
        return router.replace("/home/home");
      }

      return router.replace("/calendar/seeCalendar");
    };

    run();
  }, [loading, userData]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
