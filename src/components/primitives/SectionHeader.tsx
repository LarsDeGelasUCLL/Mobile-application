import { View } from "react-native";
import { StyledButton } from "./StyledButton";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";

interface SectionHeaderProps {
  title: string;
  /** Shown as "Title (n)". */
  count?: number;
  /**
   * `label` (default): small, bold, muted ("MEMBERS (3)").
   * `title`: large, bold ("Recent expenses" on Home).
   */
  variant?: "label" | "title";
  /** Text link on the right, e.g. "See all". Shown when `onAction` is set. */
  actionLabel?: string;
  onAction?: () => void;
  actionTestID?: string;
  testID?: string;
}

export function SectionHeader({
  title,
  count,
  variant = "label",
  actionLabel,
  onAction,
  actionTestID,
  testID,
}: SectionHeaderProps) {
  const { t } = useI18n();
  const styles = useStyles();
  const heading = count !== undefined ? `${title} (${count})` : title;
  return (
    <View style={styles.base} testID={testID}>
      <View style={styles.title}>
        {variant === "title" ? (
          <Text size="lg" weight="bold">
            {heading}
          </Text>
        ) : (
          <Text size="sm" weight="bold" tone="muted">
            {heading}
          </Text>
        )}
      </View>
      {onAction !== undefined ? (
        <StyledButton
          label={actionLabel ?? t("common.seeAll")}
          onPress={onAction}
          variant="link"
          testID={actionTestID}
        />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { flex: 1 },
}));
