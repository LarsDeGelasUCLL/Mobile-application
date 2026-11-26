import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useI18n } from "../../src/i18n";
import { useAuthStore } from "../../src/state/useAuthStore";
import { useSettingsStore } from "../../src/state/useSettingsStore";
import { SessionRestore } from "../../src/features/auth/components/SessionRestore";

export default function AppLayout() {
  const { t } = useI18n();
  const { isAuthenticated, isInitialized, isLoading, initialize, userId } =
    useAuthStore(
      useShallow((state) => ({
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
        isLoading: state.isLoading,
        initialize: state.initialize,
        userId: state.user?.id,
      })),
    );
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  // Loads the saved theme app-wide; on failure the app follows the device (Settings shows the error).
  useEffect(() => {
    if (userId) void fetchSettings(userId).catch(() => undefined);
  }, [userId, fetchSettings]);

  if (!isInitialized) {
    return (
      <SessionRestore
        variant="banner"
        isLoading={isLoading}
        onRetry={() => void initialize()}
        failedMessage={t(
          isAuthenticated
            ? "app.session.profileFailed"
            : "app.session.restoreFailed",
        )}
      />
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
