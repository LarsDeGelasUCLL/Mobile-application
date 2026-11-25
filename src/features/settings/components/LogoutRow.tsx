import {
  Card,
  ConfirmDialog,
  FeedbackBanner,
  ListRow,
} from "../../../components/primitives";

interface LogoutRowProps {
  /** A failed logout; "" when none. */
  error: string;
  confirmVisible: boolean;
  isLoggingOut: boolean;
  /** Opens the confirm dialog. */
  onPress: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
}

/** "Log out" row with its error banner and confirm dialog. */
export function LogoutRow({
  error,
  confirmVisible,
  isLoggingOut,
  onPress,
  onConfirm,
  onCancel,
  testID,
}: LogoutRowProps) {
  return (
    <>
      {error !== "" ? (
        <FeedbackBanner
          tone="error"
          message={error}
          testID="settings-logout-error"
        />
      ) : null}
      <Card flush testID={testID}>
        <ListRow
          icon="log-out-outline"
          label="Log out"
          destructive
          onPress={onPress}
          testID="settings-logout-button"
        />
      </Card>
      <ConfirmDialog
        visible={confirmVisible}
        title="Log out of Laruna?"
        message="You can log back in with your email and password."
        confirmLabel="Log out"
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={isLoggingOut}
        testID="logout-dialog"
      />
    </>
  );
}
