import { View } from "react-native";
import { FeedbackBanner } from "../../../components/primitives";
import { makeStyles } from "../../../theme/ThemeProvider";

interface ServiceWorkerNoticeProps {
  /** Registers the service worker again. */
  onRetry: () => void;
  testID?: string;
}

/** Warning above every screen when offline support (the service worker) failed. */
export function ServiceWorkerNotice({
  onRetry,
  testID,
}: ServiceWorkerNoticeProps) {
  const styles = useStyles();
  return (
    <View style={styles.notice} testID={testID}>
      <FeedbackBanner
        tone="warning"
        message="Offline support could not start. The app is still available online."
        onRetry={onRetry}
        retryLabel="Retry offline support"
        testID="service-worker-error"
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  notice: { paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.sm },
}));
