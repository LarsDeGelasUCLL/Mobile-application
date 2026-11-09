import { StyleSheet, View } from "react-native";
import { Screen } from "../../src/components/primitives/Screen";
import { Stack } from "../../src/components/primitives/Stack";
import { Row } from "../../src/components/primitives/Row";
import { Text } from "../../src/components/primitives/Text";
import { Card } from "../../src/components/primitives/Card";
import { Badge } from "../../src/components/primitives/Badge";
import { EmptyState } from "../../src/components/primitives/EmptyState";
import { Icon } from "../../src/components/primitives/Icon";
import { StyledButton } from "../../src/components/StyledButton";
import { colors } from "../../src/types/theme";

export default function GroupsScreen() {
  return (
    <Screen padding="lg">
      <Stack gap="lg">
        <Row justify="space-between" align="center">
          <Stack gap="none">
            <Text size="xl" weight="bold">
              Your groups
            </Text>
            <Text size="sm" color={colors.muted}>
              Shared plans, made easier to manage
            </Text>
          </Stack>
          <Badge label="0 groups" />
        </Row>

        <View style={styles.intro}>
          <View style={styles.iconWrap}>
            <Icon name="people-outline" size={24} color={colors.primary} />
          </View>
          <Text size="lg" weight="bold">
            Better together
          </Text>
          <Text align="center" color={colors.muted}>
            Keep trips, home expenses, and shared plans organized in one place.
          </Text>
        </View>

        <EmptyState
          title="No groups yet"
          description="Create your first group or join friends with an invite code. Your shared activity will appear here."
        />

        <Card>
          <Stack gap="sm">
            <StyledButton
              label="Create a group"
              onPress={() => console.log("Nieuwe groep")}
              variant="primary"
              testID="create-group-button"
            />
            <StyledButton
              label="Join with an invite code"
              onPress={() => console.log("Join group placeholder")}
              variant="secondary"
              testID="join-group-button"
            />
            <Text size="sm" align="center" color={colors.muted}>
              Group creation and invite joining are coming soon.
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  iconWrap: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
});
