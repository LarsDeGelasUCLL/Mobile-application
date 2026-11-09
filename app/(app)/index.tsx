import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import {
  Badge,
  EmptyState,
  Icon,
  Row,
  Screen,
  Stack,
  Text,
} from "../../src/components/primitives";
import { StyledButton } from "../../src/components/StyledButton";
import { colors } from "../../src/types/theme";

export default function HomeScreen() {
  const { user, logout } = useAuthStore();

  return (
    <Screen padding="lg">
      <Stack gap="lg">
        <Stack gap="sm">
          <Row justify="space-between" align="center">
            <Stack gap="sm">
              <Text size="sm" weight="bold" color={colors.primary}>
                A LITTLE BETTER TOGETHER
              </Text>
              <Text size="xl" weight="bold">
                {user?.name ? `Hi, ${user.name}` : "Welcome"}
              </Text>
            </Stack>
            <Badge label="Preview" />
          </Row>
          <Text color={colors.muted}>
            Shared plans, clear balances, and fewer awkward reminders.
          </Text>
        </Stack>

        <View style={styles.hero}>
          <View style={styles.heroLabel}>
            <Icon name="sparkles-outline" size={17} color="#FFFFFF" />
            <Text size="sm" weight="medium" color="#FFFFFF">
              YOUR SHARED WALLET
            </Text>
          </View>
          <Text size="xl" weight="bold" color="#FFFFFF">
            More time together. Less time splitting costs.
          </Text>
          <Text color="#EEE8FB">
            Your group balances and recent activity will have a home here.
          </Text>
          <View style={styles.heroFooter}>
            <Icon name="people-outline" size={18} color="#E3D8FA" />
            <Text size="sm" color="#EEE8FB">
              Start with a group
            </Text>
          </View>
        </View>

        <EmptyState
          title="Your first group starts here"
          description="Create a space for a trip, a shared home, or your next dinner plan."
          action={
            <StyledButton
              label="Explore groups"
              onPress={() => router.push("/groups")}
              testID="go-to-groups-button"
            />
          }
        />

        <StyledButton
          label="My profile"
          onPress={() => router.push("/profile")}
          variant="secondary"
          testID="go-to-profile-button"
        />

        <StyledButton label="Log out" onPress={logout} variant="secondary" />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 14,
    padding: 22,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
  },
  heroLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#765DB4",
  },
});
