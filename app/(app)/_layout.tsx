import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Overzicht" }} />
      <Stack.Screen name="profile" options={{ title: "Mijn Profiel" }} />
      <Stack.Screen name="details/[id]" options={{ title: "Details" }} />
    </Stack>
  );
}
