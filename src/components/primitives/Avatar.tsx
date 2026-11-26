import { View, Image } from "react-native";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";

interface AvatarProps {
  uri?: string;
  /** Used for the initials when there is no `uri`. */
  name?: string;
  size?: "sm" | "md" | "lg";
  testID?: string;
}

/** A round profile picture, or the name's initials ("?" without a name). */
export function Avatar({ uri, name, size = "md", testID }: AvatarProps) {
  const styles = useStyles();
  const initials = name
    ? name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (uri !== undefined) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, styles[size]]}
        testID={testID}
      />
    );
  }

  return (
    <View
      style={[styles.base, styles[size], styles.fallback]}
      testID={testID}
    >
      <Text
        size={size === "lg" ? "lg" : "sm"}
        weight="bold"
        tone="primary"
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
