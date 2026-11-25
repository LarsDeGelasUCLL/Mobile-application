import { View } from "react-native";
import { StyledButton } from "./StyledButton";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";

type FeedbackTone = "error" | "success" | "warning";

interface FeedbackBannerProps {
  message: string;
  tone: FeedbackTone;
  /** Shows a secondary retry button under the message. */
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  retryTestID?: string;
  testID?: string;
}

export function FeedbackBanner({
  message,
  tone,
  onRetry,
  retryLabel = "Retry",
  isRetrying = false,
  retryTestID,
  testID,
}: FeedbackBannerProps) {
  const styles = useStyles();
  return (
    <View
      accessibilityRole="alert"
      style={[styles.base, styles[tone]]}
      testID={testID}
    >
      <Text size="sm" tone={tone}>
        {message}
      </Text>
      {onRetry !== undefined ? (
        <StyledButton
          label={retryLabel}
          onPress={onRetry}
          variant="secondary"
          isLoading={isRetrying}
          testID={retryTestID}
        />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    borderRadius: t.radius.sm,
    borderWidth: 1,
    padding: t.spacing.md,
    gap: t.spacing.sm,
  },
  error: {
    borderColor: t.colors.error,
    backgroundColor: t.colors.errorSoft,
  },
  success: {
    borderColor: t.colors.success,
    backgroundColor: t.colors.successSoft,
  },
  warning: {
    borderColor: t.colors.warning,
    backgroundColor: t.colors.warningSoft,
  },
}));
