import { router, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, IconButton } from "../../../src/components/primitives";
import type { IconName } from "../../../src/components/primitives/Icon";
import { useI18n } from "../../../src/i18n";
import { useGroupStore } from "../../../src/state/useGroupStore";
import { useTheme } from "../../../src/theme/ThemeProvider";

/** The bottom tab bar (Home, Groups, Expenses, Profile). The Groups tab shows a badge with open invites. */
export default function TabsLayout() {
  const { t } = useI18n();
  const { colors, fontFamily } = useTheme();
  const inviteCount = useGroupStore((state) => state.pendingInvites.length);
  const tabBarBottom = Math.max(useSafeAreaInsets().bottom, 8);

  const tabIcon = (active: IconName, inactive: IconName) =>
    function TabIcon({ focused }: { focused: boolean }) {
      return (
        <Icon
          name={focused ? active : inactive}
          size={24}
          tone={focused ? "primary" : "muted"}
        />
      );
    };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          // Keep the home-indicator inset; a fixed height would drop it.
          height: 56 + tabBarBottom,
          paddingBottom: tabBarBottom,
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
          title: t("tabs.home"),
          tabBarButtonTestID: "tab-home",
          tabBarIcon: tabIcon("home", "home-outline"),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: t("tabs.groups"),
          tabBarButtonTestID: "tab-groups",
          tabBarIcon: tabIcon("people", "people-outline"),
          tabBarBadge: inviteCount > 0 ? inviteCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.onPrimary,
          },
          tabBarAccessibilityLabel:
            inviteCount > 0
              ? t("tabs.groupsWithInvites", { count: inviteCount })
              : t("tabs.groups"),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: t("tabs.expenses"),
          tabBarButtonTestID: "tab-expenses",
          tabBarIcon: tabIcon("wallet", "wallet-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarButtonTestID: "tab-profile",
          tabBarIcon: tabIcon("person", "person-outline"),
          headerRight: () => (
            <IconButton
              icon="settings-outline"
              accessibilityLabel={t("tabs.openSettings")}
              onPress={() => router.push("/settings")}
              testID="open-settings-button"
            />
          ),
        }}
      />
    </Tabs>
  );
}
