import { Redirect, Tabs } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import { Icon } from "../../src/components/primitives/Icon";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color ?? (focused ? "#2563EB" : "#6B7280")}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "people" : "people-outline"}
              size={24}
              color={color ?? (focused ? "#2563EB" : "#6B7280")}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color ?? (focused ? "#2563EB" : "#6B7280")}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color ?? (focused ? "#2563EB" : "#6B7280")}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="details/[id]"
        options={{
          href: null,
          title: "Details",
        }}
      />
    </Tabs>
  );
}
