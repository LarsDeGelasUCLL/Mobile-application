import { router, Tabs } from "expo-router";
import { Icon, IconButton } from "../../../src/components/primitives";
import type { IconName } from "../../../src/components/primitives/Icon";
import { useGroupStore } from "../../../src/state/useGroupStore";
import { useTheme } from "../../../src/theme/ThemeProvider";

export default function TabsLayout() {
  const { colors, fontFamily } = useTheme();
  const inviteCount = useGroupStore((state) => state.pendingInvites.length);

  const tabIcon =
    (active: IconName, inactive: IconName) =>
    ({ focused }: { focused: boolean }) => (
      <Icon
        name={focused ? active : inactive}
        size={24}
        color={focused ? colors.primary : colors.textMuted}
      />
    );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.semibold },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: fontFamily.bold,
          color: colors.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarButtonTestID: "tab-home",
          tabBarIcon: tabIcon("home", "home-outline"),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarButtonTestID: "tab-groups",
          tabBarIcon: tabIcon("people", "people-outline"),
          tabBarBadge: inviteCount > 0 ? inviteCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.onPrimary,
          },
          tabBarAccessibilityLabel:
            inviteCount > 0
              ? `Groups, ${inviteCount} pending invitation${inviteCount === 1 ? "" : "s"}`
              : "Groups",
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarButtonTestID: "tab-expenses",
          tabBarIcon: tabIcon("wallet", "wallet-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarButtonTestID: "tab-profile",
          tabBarIcon: tabIcon("person", "person-outline"),
          headerRight: () => (
            <IconButton
              icon="settings-outline"
              accessibilityLabel="Open settings"
              onPress={() => router.push("/settings")}
              color={colors.text}
              testID="open-settings-button"
            />
          ),
        }}
      />
    </Tabs>
  );
}
