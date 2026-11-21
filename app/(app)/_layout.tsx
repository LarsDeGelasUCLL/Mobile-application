import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import {
  Screen,
  Stack as ContentStack,
  Text,
} from "../../src/components/primitives";
import { StyledButton } from "../../src/components/common/StyledButton";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialize = useAuthStore((state) => state.initialize);

  if (!isInitialized) {
    return (
      <Screen padding="lg">
        <ContentStack gap="md">
          <Text>
            {isLoading
              ? "Restoring your session..."
              : isAuthenticated
                ? "Could not load your profile."
                : "Could not restore your session."}
          </Text>
          {!isLoading ? (
            <StyledButton
              label="Try again"
              onPress={() => void initialize()}
              variant="secondary"
            />
          ) : null}
        </ContentStack>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="group/[groupId]" />
      <Stack.Screen name="expense/create" />
      <Stack.Screen name="expense/[expenseId]" />
      <Stack.Screen name="expense/edit/[expenseId]" />
    </Stack>
  );
}
