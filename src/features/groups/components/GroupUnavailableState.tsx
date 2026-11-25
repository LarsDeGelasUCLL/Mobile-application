import { EmptyState, StyledButton } from "../../../components/primitives";

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
  return (
    <EmptyState
      icon="people-outline"
      title="Group unavailable"
      description="This group could not be found in your active groups."
      action={
        <StyledButton
          label="Back to groups"
          onPress={onBack}
          variant="secondary"
        />
      }
      testID={testID}
    />
  );
}
