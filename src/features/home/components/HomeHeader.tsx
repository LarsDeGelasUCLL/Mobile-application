import { Avatar, Row, Text } from "../../../components/primitives";

interface HomeHeaderProps {
  name: string;
}

export function HomeHeader({ name }: HomeHeaderProps) {
  return (
    <Row justify="space-between" align="center">
      <Row align="center" gap="sm">
        <Avatar name={name} />
        <Text size="lg" weight="bold">
          {name}
        </Text>
      </Row>
    </Row>
  );
}
