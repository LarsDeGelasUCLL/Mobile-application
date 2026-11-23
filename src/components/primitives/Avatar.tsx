import { View, Image } from "react-native";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ uri, name, size = "md" }: AvatarProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (uri !== undefined) {
    return <Image source={{ uri }} style={[styles.base, styles[size]]} />;
  }

  return (
    <View style={[styles.base, styles[size], styles.fallback]}>
      <Text
        size={size === "lg" ? "lg" : "sm"}
        weight="bold"
        color={colors.primaryText}
      >
        {initials}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    borderRadius: t.radius.full,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  fallback: {
    backgroundColor: t.colors.primarySoft,
    borderWidth: 1,
    borderColor: t.colors.primaryBorder,
  },
  sm: { width: 32, height: 32 },
  md: { width: 44, height: 44 },
  lg: { width: 64, height: 64 },
}));
