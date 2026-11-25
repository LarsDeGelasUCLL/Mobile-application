import { Avatar, Row, Text } from "../../../components/primitives";

interface HomeHeaderProps {
  name: string;
  testID?: string;
}

export function HomeHeader({ name, testID }: HomeHeaderProps) {
  return (
    <Row justify="space-between" align="center" testID={testID}>
      <Row align="center" gap="sm">
        <Avatar name={name} />
        <Text size="lg" weight="bold">
          {name}
        </Text>
      </Row>
    </Row>
  );
}
