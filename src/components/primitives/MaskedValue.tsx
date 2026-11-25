import { useEffect, useState } from "react";
import { Pressable, Share, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface MaskedValueProps {
  label: string;
  value: string;
  /** Adds a Share action (OS share sheet). */
  shareMessage?: string;
  testID?: string;
}

// Fixed-length mask: does not leak the value's length.
const MASK = "••••••••";

/** Sensitive value (invite code, IBAN): hidden until the user taps Reveal. */
export function MaskedValue({
  label,
  value,
  shareMessage,
  testID,
}: MaskedValueProps) {
  const styles = useStyles();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    // Clipboard can be blocked (web permissions); then "Copied" never shows.
    Clipboard.setStringAsync(value)
      .then(() => setCopied(true))
      .catch(() => undefined);
  };

  const share = () => {
    // Dismissed or unsupported share sheet is not an error for the user.
    Share.share({ message: shareMessage ?? value }).catch(() => undefined);
  };

  return (
    <View style={styles.base} testID={testID}>
      <Text size="sm" weight="medium" tone="muted">
        {label}
      </Text>
      <View
        style={styles.valueBox}
        testID={testID !== undefined ? `${testID}-value` : undefined}
      >
        <Text size="lg" weight="bold">
          {revealed ? value : MASK}
        </Text>
      </View>
      <View style={styles.actions}>
        <Action
          icon={revealed ? "eye-off-outline" : "eye-outline"}
          label={revealed ? "Hide" : "Reveal"}
          onPress={() => setRevealed((v) => !v)}
          testID={testID !== undefined ? `${testID}-reveal` : undefined}
        />
        <Action
          icon={copied ? "checkmark" : "copy-outline"}
          label={copied ? "Copied" : "Copy"}
          onPress={copy}
          testID={testID !== undefined ? `${testID}-copy` : undefined}
        />
        {shareMessage !== undefined && (
          <Action
            icon="share-outline"
            label="Share"
            onPress={share}
            testID={testID !== undefined ? `${testID}-share` : undefined}
          />
        )}
      </View>
    </View>
  );
}

function Action({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const styles = useStyles();
  const { iconSize } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      testID={testID}
    >
      <Icon name={icon} size={iconSize.md} tone="primary" />
      <Text size="sm" weight="medium" tone="primary">
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: { gap: t.spacing.sm },
  valueBox: {
    minHeight: t.controlSize.row,
    justifyContent: "center",
    paddingHorizontal: t.spacing.lg,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surfaceTint,
  },
  actions: { flexDirection: "row", gap: t.spacing.sm },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: t.controlSize.touch,
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.primaryBorder,
  },
  pressed: { backgroundColor: t.colors.primarySoft },
}));
