import { Image, StyleSheet, View } from "react-native";
import { Text } from "../../../components/primitives";
import { useTheme } from "../../../theme/ThemeProvider";

interface GroupAvatarProps {
  name: string;
  imageUri?: string;
  fallbackColor?: string;
  size?: number;
  testID?: string;
}

export function GroupAvatar({
  name,
  imageUri,
  fallbackColor,
  size = 56,
  testID,
}: GroupAvatarProps) {
  const { colors } = useTheme();
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
        accessibilityLabel={`${name} group profile picture`}
        source={{ uri: imageUri }}
        resizeMode="cover"
        style={avatarStyle}
        testID={testID}
      />
    );
  }

  return (
    <View
      accessibilityLabel={`${name} group profile picture`}
      style={[
        ...avatarStyle,
        { backgroundColor: fallbackColor ?? colors.primary },
      ]}
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
