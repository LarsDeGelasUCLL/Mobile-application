import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import {
  Badge,
  EmptyState,
  Row,
  Screen,
  Stack,
  Text,
} from "../../src/components/primitives";
import { HeroBanner } from "../../src/features/home/components/HeroBanner";
import { StyledButton } from "../../src/components/common/StyledButton";
import { colors } from "../../src/theme/colors";

export default function HomeScreen() {
  const { user } = useAuthStore();

  return (
    <Screen padding="lg">
      <View style={styles.container} testID="home-screen">
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

          <HeroBanner
            badgeText="YOUR SHARED WALLET"
            title="More time together. Less time splitting costs."
            description="Your group balances and recent activity will have a home here."
            footerText="Start with a group"
            testID="home-hero-banner"
          />

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
        </Stack>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
