import { StyleSheet } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import { Icon, Screen, Stack, Text } from "../../src/components/primitives";
import { StyledButton } from "../../src/components/common/StyledButton";
import { colors } from "../../src/theme/colors";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialize = useAuthStore((state) => state.initialize);

  if (!isInitialized) {
    return (
      <Screen padding="lg">
        <Stack gap="md">
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
        </Stack>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarButtonTestID: "tab-home",
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? "home" : "home-outline"}
              size={24}
              color={focused ? colors.primary : colors.muted}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarButtonTestID: "tab-groups",
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? "people" : "people-outline"}
              size={24}
              color={focused ? colors.primary : colors.muted}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarButtonTestID: "tab-settings",
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={focused ? colors.primary : colors.muted}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarButtonTestID: "tab-profile",
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? "person" : "person-outline"}
              size={24}
              color={focused ? colors.primary : colors.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
  header: {
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontWeight: "700",
    color: colors.text,
  },
});
