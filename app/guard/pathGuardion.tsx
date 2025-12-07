import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { usePath } from "../../hooks/usePath";
import { useUser } from "../../hooks/useUser";
import { getItem } from "../../services/secureStore";

export default function AuthGate() {
  const handlePath = usePath();
  const { userData, loading } = useUser();

  useEffect(() => {
    const run = async () => {
      if (loading) return;

      const token = await getItem("token");
      const id = await getItem("id");

      console.log('userData no authGate', userData, token, id)

      if (!token || !id) {
        return handlePath("/auth");
      }

      if (token && id && !userData?.activity_lvl) {
        return handlePath("/home/home");
      }

      return handlePath("/calendar/seeCalendar");
    };

    run();
  }, [loading, userData]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
