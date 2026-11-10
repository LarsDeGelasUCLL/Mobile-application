import { StyleSheet, View } from "react-native";
import {
  Badge,
  Card,
  EmptyState,
  Row,
  Screen,
  Stack,
  Text,
} from "../../src/components/primitives";
import { FeatureIntro } from "../../src/features/groups/components/FeatureIntro";
import { StyledButton } from "../../src/components/common/StyledButton";
import { colors } from "../../src/theme/colors";

export default function GroupsScreen() {
  return (
    <Screen padding="lg">
      <View style={styles.container} testID="groups-screen">
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

          <FeatureIntro
            iconName="people-outline"
            title="Better together"
            description="Keep trips, home expenses, and shared plans organized in one place."
            testID="groups-feature-intro"
          />

          <EmptyState
            title="No groups yet"
            description="Create your first group or join friends with an invite code. Your shared activity will appear here."
          />

          <Card>
            <Stack gap="sm">
              <StyledButton
                label="Create a group"
                onPress={() => console.log("New group")}
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
