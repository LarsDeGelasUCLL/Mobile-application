import {
  EmptyState,
  FeedbackBanner,
  SectionHeader,
  SkeletonCard,
  Stack,
  StyledButton,
} from "../../../components/primitives";
import type { GroupHighlight } from "../../../types";
import { GroupHighlights } from "./GroupHighlights";

interface HomeGroupsSectionProps {
  groups: GroupHighlight[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Opens the Groups tab ("See all", "Browse groups", "Find groups"). */
  onBrowse: () => void;
  onOpenGroup: (groupId: string) => void;
  testID?: string;
}

/** "Groups": title with "See all", load error with retry, then the body. */
export function HomeGroupsSection({
  groups,
  isLoading,
  error,
  onRetry,
  onBrowse,
  onOpenGroup,
  testID,
}: HomeGroupsSectionProps) {
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader
        title="Groups"
        variant="title"
        onAction={onBrowse}
        actionTestID="home-groups-see-all"
      />
      {error ? (
        <FeedbackBanner
          tone="error"
          message={error}
          onRetry={onRetry}
          retryLabel="Retry groups"
          isRetrying={isLoading}
          retryTestID="home-groups-retry-button"
          testID="home-groups-error"
        />
      ) : null}
      <HomeGroupsBody
        groups={groups}
        isLoading={isLoading}
        hasError={!!error}
        onBrowse={onBrowse}
        onOpenGroup={onOpenGroup}
      />
    </Stack>
  );
}

/** Nothing (error, no groups), skeleton, empty state, or the carousel. */
function HomeGroupsBody({
  groups,
  isLoading,
  hasError,
  onBrowse,
  onOpenGroup,
}: Pick<
  HomeGroupsSectionProps,
  "groups" | "isLoading" | "onBrowse" | "onOpenGroup"
> & { hasError: boolean }) {
  if (hasError && groups.length === 0) return null;
  if (isLoading && groups.length === 0) {
    return (
      <SkeletonCard
        lines={[
          { height: 22, width: "60%" },
          { height: 16, width: "85%" },
        ]}
      />
    );
  }
  if (groups.length === 0) {
    return (
      <EmptyState
        icon="people-outline"
        title="No groups yet"
        description="Create a group or join friends to see it here."
        action={
          <StyledButton
            label="Browse groups"
            onPress={onBrowse}
            variant="secondary"
          />
        }
      />
    );
  }
  return (
    <GroupHighlights
      groups={groups}
      onSeeAllPress={onBrowse}
      onGroupPress={(group) => onOpenGroup(group.id)}
    />
  );
}
