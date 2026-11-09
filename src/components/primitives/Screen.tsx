import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  StyleSheet,
} from "react-native";
import { colors } from "../../theme/colors";

interface ScreenProps {
  children: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  scrollable?: boolean;
}

export function Screen({
  children,
  padding = "md",
  scrollable = true,
}: ScreenProps) {
  if (!scrollable) {
    return <View style={[styles.container, styles[padding]]}>{children}</View>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoiding}
      behavior={Platform.OS === "android" ? "height" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, styles[padding]]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
  },
  none: {
    padding: 0,
  },
  sm: {
    padding: 8,
  },
  md: {
    padding: 16,
  },
  lg: {
    padding: 24,
  },
});
