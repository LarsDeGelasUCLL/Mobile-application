import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
  type ScrollViewProps,
} from "react-native";
import { StickyFooter } from "./StickyFooter";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface ScreenProps {
  children: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Sticky bottom bar (primary action). Stays above the keyboard. */
  footer?: React.ReactNode;
  testID?: string;
}

// Web: "on-drag" blurs an input right after it gains focus, so no drag dismiss there.
const keyboardDismissMode: ScrollViewProps["keyboardDismissMode"] =
  Platform.select({ ios: "interactive", android: "on-drag", default: "none" });

export function Screen({
  children,
  padding = "md",
  scrollable = true,
  refreshing = false,
  onRefresh,
  footer,
  testID,
}: ScreenProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const footerBar =
    footer !== undefined ? <StickyFooter>{footer}</StickyFooter> : null;

  if (!scrollable) {
    return (
      <View style={styles.container} testID={testID}>
        <View style={[styles.fill, styles[padding]]}>{children}</View>
        {footerBar}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : undefined}
      testID={testID}
    >
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.content, styles[padding]]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={keyboardDismissMode}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        refreshControl={
          onRefresh !== undefined ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
      {footerBar}
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  fill: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  none: { padding: 0 },
  sm: { padding: t.spacing.sm },
  md: { padding: t.spacing.lg },
  lg: { padding: t.spacing.xl },
}));
