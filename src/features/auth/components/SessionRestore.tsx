import {
  FeedbackBanner,
  Screen,
  Spinner,
  Stack,
  StyledButton,
  Text,
} from "../../../components/primitives";
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
  const { isLoading, onRetry, testID } = props;
  if (props.variant === "banner") {
    return (
      <Screen padding="lg">
        <Stack gap="md" testID={testID}>
          {isLoading ? (
            <>
              <Spinner />
              <Text>Restoring your session...</Text>
            </>
          ) : (
            <FeedbackBanner
              tone="error"
              message={props.failedMessage ?? "Could not restore your session."}
              onRetry={onRetry}
              retryLabel="Try again"
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
              Restoring your session...
            </Text>
          </>
        ) : (
          <>
            <Text align="center" weight="bold">
              Could not restore your session
            </Text>
            <Text size="sm" align="center" tone="muted">
              Check your connection and try again.
            </Text>
            <StyledButton
              label="Try again"
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
