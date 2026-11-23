import { Modal, Pressable, View } from "react-native";
import { StyledButton } from "../common/StyledButton";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface ConfirmDialogProps {
  visible: boolean;
  /** Name the object: "Leave 'Weekend Ghent'?" (design §4). */
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Red confirm button. Default true: dialogs guard destructive actions. */
  destructive?: boolean;
  isLoading?: boolean;
  testID?: string;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  destructive = true,
  isLoading = false,
  testID,
}: ConfirmDialogProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  // Block dismiss while the action runs, so the user sees its result.
  const cancel = () => {
    if (!isLoading) onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cancel}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={cancel}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        />
        <View
          style={styles.dialog}
          accessibilityRole="alert"
          accessibilityViewIsModal
          testID={testID}
        >
          <Text size="lg" weight="bold">
            {title}
          </Text>
          {message !== undefined && (
            <Text color={colors.textMuted}>{message}</Text>
          )}
          <View style={styles.actions}>
            <StyledButton
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? "danger" : "primary"}
              isLoading={isLoading}
              testID={testID !== undefined ? `${testID}-confirm` : undefined}
            />
            <StyledButton
              label={cancelLabel}
              onPress={cancel}
              variant="secondary"
              disabled={isLoading}
              testID={testID !== undefined ? `${testID}-cancel` : undefined}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: t.spacing.xl,
  },
  scrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: t.colors.scrim,
  },
  dialog: {
    width: "100%",
    maxWidth: 400,
    gap: t.spacing.md,
    padding: t.spacing.xl,
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
    shadowColor: t.colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  actions: { gap: t.spacing.sm, marginTop: t.spacing.sm },
}));
