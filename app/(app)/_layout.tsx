import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../../src/state/useAuthStore";
import { useSettingsStore } from "../../src/state/useSettingsStore";
import {
  FeedbackBanner,
  Screen,
  Stack as ContentStack,
  Spinner,
  StyledButton,
  Text,
} from "../../src/components/primitives";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialize = useAuthStore((state) => state.initialize);
  const userId = useAuthStore((state) => state.user?.id);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  // Loads the saved theme app-wide; on failure the app follows the device (Settings shows the error).
  useEffect(() => {
    if (userId) void fetchSettings(userId).catch(() => undefined);
  }, [userId, fetchSettings]);

  if (!isInitialized) {
    return (
      <Screen padding="lg">
        <ContentStack gap="md">
          {isLoading ? (
            <>
              <Spinner />
              <Text>Restoring your session...</Text>
            </>
          ) : (
            <FeedbackBanner tone="error" testID="session-recovery-error">
              <Text size="sm">
                {isAuthenticated
                  ? "Could not load your profile."
                  : "Could not restore your session."}
              </Text>
              <StyledButton
                label="Try again"
                onPress={() => void initialize()}
                variant="secondary"
              />
            </FeedbackBanner>
          )}
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
      <Stack.Screen name="settings/index" />
      <Stack.Screen name="settings/profile" />
      <Stack.Screen name="settings/email" />
      <Stack.Screen name="settings/password" />
      <Stack.Screen name="group/create" />
      <Stack.Screen name="group/join" />
      <Stack.Screen name="group/[groupId]/index" />
      <Stack.Screen name="group/[groupId]/settings" />
      <Stack.Screen name="group/[groupId]/expenses" />
      <Stack.Screen name="expense/create" />
      <Stack.Screen name="expense/[expenseId]" />
      <Stack.Screen name="expense/edit/[expenseId]" />
    </Stack>
  );
}
