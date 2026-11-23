import { StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";

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

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  error: {
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
  },
  success: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  warning: {
    borderColor: colors.warning,
    backgroundColor: colors.warningSoft,
  },
});
