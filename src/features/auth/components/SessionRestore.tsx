import {
  FeedbackBanner,
  Screen,
  Spinner,
  Stack,
  StyledButton,
  Text,
} from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import { AuthScreen } from "./AuthScreen";

interface SessionRestoreBaseProps {
  /** Restoring (spinner) or failed (retry). */
  isLoading: boolean;
  onRetry: () => void;
}

type SessionRestoreProps = SessionRestoreBaseProps &
  (
    | {
        /** The login page's branded card with its own retry button. */
        variant: "card";
        /** On the card's content. */
        testID?: string;
      }
    | {
        /** The signed-in layout's plain spinner and error banner. */
        variant: "banner";
        /** The banner's error text. */
        failedMessage?: string;
        /** On the spinner / banner stack. */
        testID?: string;
      }
  );

/** Shown until the auth store has restored (or failed to restore) the session. */
export function SessionRestore(props: SessionRestoreProps) {
  const { t } = useI18n();
  const { isLoading, onRetry, testID } = props;
  if (props.variant === "banner") {
    return (
      <Screen padding="lg">
        <Stack gap="md" testID={testID}>
          {isLoading ? (
            <>
              <Spinner />
              <Text align="center" tone="muted">
                {t("app.session.restoring")}
              </Text>
            </>
          ) : (
            <FeedbackBanner
              tone="error"
              message={props.failedMessage ?? t("app.session.restoreFailed")}
              onRetry={onRetry}
              retryLabel={t("common.tryAgain")}
              testID="session-recovery-error"
            />
          )}
        </Stack>
      </Screen>
    );
  }

  return (
    <AuthScreen contentTestID={testID}>
      <Stack gap="md" align="center" padding="md">
        {isLoading ? (
          <>
            <Spinner size="large" />
            <Text align="center" tone="muted">
              {t("app.session.restoring")}
            </Text>
          </>
        ) : (
          <>
            <Text align="center" weight="bold">
              {t("app.session.restoreFailedTitle")}
            </Text>
            <Text size="sm" align="center" tone="muted">
              {t("app.session.checkConnection")}
            </Text>
            <StyledButton
              label={t("common.tryAgain")}
              onPress={onRetry}
              variant="secondary"
              testID="auth-bootstrap-retry"
            />
          </>
        )}
      </Stack>
    </AuthScreen>
  );
}
