import { Image, StyleSheet, View } from "react-native";
import { Text } from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import { useTheme } from "../../../theme/ThemeProvider";

interface GroupAvatarProps {
  name: string;
  imageUri?: string;
  size?: number;
  testID?: string;
}

export function GroupAvatar({
  name,
  imageUri,
  size = 56,
  testID,
}: GroupAvatarProps) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const label = t("groups.avatar.label", { name });
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const avatarStyle = [
    styles.avatar,
    { width: size, height: size, borderRadius: size / 2 },
  ];

  if (imageUri) {
    return (
      <Image
        accessibilityLabel={label}
        source={{ uri: imageUri }}
        resizeMode="cover"
        style={avatarStyle}
        testID={testID}
      />
    );
  }

  return (
    <View
      accessibilityLabel={label}
      style={[...avatarStyle, { backgroundColor: colors.primary }]}
      testID={testID}
    >
      <Text size={size < 48 ? "sm" : "md"} weight="bold" tone="onPrimary">
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
