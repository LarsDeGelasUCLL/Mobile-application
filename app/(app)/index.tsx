import { router } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import { Screen } from "../../src/components/primitives/Screen";
import { Stack } from "../../src/components/primitives/Stack";
import { Text } from "../../src/components/primitives/Text";
import { EmptyState } from "../../src/components/primitives/EmptyState";
import { StyledButton } from "../../src/components/StyledButton";
import { Badge } from "@/components/primitives";

export default function HomeScreen() {
  const { user, logout } = useAuthStore();

  return (
    <Screen padding="lg">
      <Stack gap="lg">
        <Text size="xl" weight="bold">
          {user !== null ? `Welcome, ${user.name}` : "Welcome"}
        </Text>
        <Text>Beheer hier straks je groepen en gedeelde uitgaven.</Text>
        <Badge label={"Account gekoppeld"} variant={"success"} />

        <EmptyState
          title="Nog geen groepen"
          description="Maak een groep aan of koppel Supabase tabellen om je kosten bij te houden."
        />

        <StyledButton
          label="Mijn Profiel"
          onPress={() => router.push("/profile")}
          variant="primary"
          testID="go-to-profile-button"
        />

        <StyledButton label="Log out" onPress={logout} variant="secondary" />
      </Stack>
    </Screen>
  );
}
