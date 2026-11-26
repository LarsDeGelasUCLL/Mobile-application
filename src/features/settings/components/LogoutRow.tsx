import {
  Card,
  ConfirmDialog,
  FeedbackBanner,
  ListRow,
  Stack,
} from "../../../components/primitives";
import { useI18n } from "../../../i18n";

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

/** "Log out" row with its error banner and confirm dialog. `testID` goes on
 * the wrapping stack, whose gap matches the settings page's. */
export function LogoutRow({
  error,
  confirmVisible,
  isLoggingOut,
  onPress,
  onConfirm,
  onCancel,
  testID,
}: LogoutRowProps) {
  const { t } = useI18n();
  return (
    <Stack gap="lg" testID={testID}>
      {error !== "" ? (
        <FeedbackBanner
          tone="error"
          message={error}
          testID="settings-logout-error"
        />
      ) : null}
      <Card flush>
        <ListRow
          icon="log-out-outline"
          label={t("settings.logout.label")}
          destructive
          onPress={onPress}
          testID="settings-logout-button"
        />
      </Card>
      <ConfirmDialog
        visible={confirmVisible}
        title={t("settings.logout.title")}
        message={t("settings.logout.message")}
        confirmLabel={t("settings.logout.label")}
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={isLoggingOut}
        testID="logout-dialog"
      />
    </Stack>
  );
}
