import { Pressable, StyleSheet, View } from "react-native";
import { Avatar, Icon, Row, Text } from "../../../components/primitives";
import { colors } from "../../../theme/colors";

interface HomeHeaderProps {
  name: string;
  onNotificationsPress: () => void;
}

export function HomeHeader({ name, onNotificationsPress }: HomeHeaderProps) {
  return (
    <Row justify="space-between" align="center">
      <Row align="center" gap="sm">
        <Avatar name={name} />
        <Text size="lg" weight="bold">
          {name}
        </Text>
      </Row>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open notifications"
        onPress={onNotificationsPress}
        style={styles.notificationButton}
        testID="home-notifications-button"
      >
        <Icon name="notifications-outline" size={23} color={colors.text} />
        <View style={styles.notificationDot} />
      </Pressable>
    </Row>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: colors.surface,
  },
});
