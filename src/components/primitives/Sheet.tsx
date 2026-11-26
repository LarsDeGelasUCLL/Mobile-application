import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  testID?: string;
}

/** Bottom sheet for small choices: + menu, dropdown options, invite code. */
export function Sheet({
  visible,
  onClose,
  title,
  children,
  testID,
}: SheetProps) {
  const { t } = useI18n();
  const styles = useStyles();
  const { spacing } = useTheme();
  const { bottom } = useSafeAreaInsets();

  // Fade, not slide: low motion (design §3.3) and the scrim does not slide with the panel.
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
        />
        <View
          style={[
            styles.panel,
            { paddingBottom: Math.max(bottom, spacing.lg) },
          ]}
          accessibilityViewIsModal
          testID={testID}
        >
          <View style={styles.handle} />
          {title !== undefined && (
            <Text size="lg" weight="bold">
              {title}
            </Text>
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, justifyContent: "flex-end" },
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: t.colors.scrim,
  },
  panel: {
    gap: t.spacing.md,
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.sm,
    backgroundColor: t.colors.surface,
    borderTopLeftRadius: t.radius.lg,
    borderTopRightRadius: t.radius.lg,
    maxHeight: "85%",
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    shadowColor: t.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.border,
    marginBottom: t.spacing.xs,
  },
}));
