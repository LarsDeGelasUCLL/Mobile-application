import { EmptyState, StyledButton } from "../../../components/primitives";
import { useI18n } from "../../../i18n";

interface GroupUnavailableStateProps {
  /** "Back to groups": each page picks how it leaves the dead group. */
  onBack: () => void;
  testID?: string;
}

/** Shown when the group is not among the user's active groups. */
export function GroupUnavailableState({
  onBack,
  testID,
}: GroupUnavailableStateProps) {
  const { t } = useI18n();
  return (
    <EmptyState
      icon="people-outline"
      title={t("groups.unavailable.title")}
      description={t("groups.unavailable.text")}
      action={
        <StyledButton
          label={t("groups.unavailable.back")}
          onPress={onBack}
          variant="secondary"
        />
      }
      testID={testID}
    />
  );
}
