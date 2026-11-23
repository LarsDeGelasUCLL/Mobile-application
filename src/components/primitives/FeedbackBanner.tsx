import { View } from "react-native";
import { makeStyles } from "../../theme/ThemeProvider";

type FeedbackTone = "error" | "success" | "warning";

interface FeedbackBannerProps {
  tone: FeedbackTone;
  children: React.ReactNode;
  testID?: string;
}

export function FeedbackBanner({
  tone,
  children,
  testID,
}: FeedbackBannerProps) {
  const styles = useStyles();
  return (
    <View
      accessibilityRole="alert"
      style={[styles.base, styles[tone]]}
      testID={testID}
    >
      {children}
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
