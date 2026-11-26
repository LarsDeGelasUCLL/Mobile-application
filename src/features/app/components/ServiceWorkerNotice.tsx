import { View } from "react-native";
import { FeedbackBanner } from "../../../components/primitives";
import { useI18n } from "../../../i18n";
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
  const { t } = useI18n();
  const styles = useStyles();
  return (
    <View style={styles.notice} testID={testID}>
      <FeedbackBanner
        tone="warning"
        message={t("app.serviceWorker.failed")}
        onRetry={onRetry}
        retryLabel={t("app.serviceWorker.retry")}
        testID="service-worker-error"
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  notice: { paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.sm },
}));
