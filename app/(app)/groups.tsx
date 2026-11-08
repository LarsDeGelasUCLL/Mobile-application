import { Screen } from "../../src/components/primitives/Screen";
import { Stack } from "../../src/components/primitives/Stack";
import { Row } from "../../src/components/primitives/Row";
import { Text } from "../../src/components/primitives/Text";
import { Card } from "../../src/components/primitives/Card";
import { Badge } from "../../src/components/primitives/Badge";
import { EmptyState } from "../../src/components/primitives/EmptyState";
import { StyledButton } from "../../src/components/StyledButton";

export default function GroupsScreen() {
  return (
    <Screen padding="lg">
      <Stack gap="lg">
        <Row justify="space-between" align="center">
          <Stack gap="none">
            <Text size="xl" weight="bold">
              Mijn Groepen
            </Text>
            <Text size="sm" color="#6B7280">
              Beheer groepskosten of onderlinge uitgaven
            </Text>
          </Stack>
          <Badge label="0 actief" variant="default" />
        </Row>

        <Card>
          <Stack gap="sm">
            <StyledButton
              label="+ Nieuwe groep aanmaken"
              onPress={() => console.log("Nieuwe groep")}
              variant="primary"
              testID="create-group-button"
            />
            <StyledButton
              label="Deelnemen met invite-code"
              onPress={() => console.log("Join groep")}
              variant="secondary"
              testID="join-group-button"
            />
          </Stack>
        </Card>

        <EmptyState
          title="Nog geen groepen gevonden"
          description="Maak je eerste groep aan voor je vriendengroep, reis of project om kosten te delen."
        />
      </Stack>
    </Screen>
  );
}
