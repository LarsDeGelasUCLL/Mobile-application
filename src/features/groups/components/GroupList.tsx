import {
  CardList,
  EmptyState,
  ListRow,
  SectionHeader,
  SkeletonCard,
  Stack,
  StyledButton,
} from "../../../components/primitives";
import { groupSummary } from "../groupSummary";
import type { UserGroupDto } from "../../../types";

interface GroupListProps {
  groups: UserGroupDto[];
  joinRequestCounts: Readonly<Record<string, number>>;
  isLoading: boolean;
  /** The page shows the load error in its banner; the list then stays empty. */
  hasError: boolean;
  onOpenGroup: (groupId: string) => void;
  onCreate: () => void;
  onJoin: () => void;
  testID?: string;
}

/** "YOUR GROUPS": skeleton, empty state with create / join, or one row per group. */
export function GroupList({ testID, ...props }: GroupListProps) {
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title="YOUR GROUPS" />
      <GroupListBody {...props} />
    </Stack>
  );
}

function GroupListBody({
  groups,
  joinRequestCounts,
  isLoading,
  hasError,
  onOpenGroup,
  onCreate,
  onJoin,
}: Omit<GroupListProps, "testID">) {
  if (hasError && groups.length === 0) return null;
  if (isLoading && groups.length === 0) {
    return (
      <SkeletonCard
        lines={[
          { height: 22, width: "60%" },
          { height: 16, width: "35%" },
        ]}
      />
    );
  }
  if (groups.length === 0) {
    return (
      <EmptyState
        icon="people-outline"
        title="No groups yet"
        description="Create a group, or join friends with an invite code."
        action={
          <Stack gap="sm">
            <StyledButton
              label="Create group"
              onPress={onCreate}
              testID="groups-empty-create"
            />
            <StyledButton
              label="Join with code"
              onPress={onJoin}
              variant="link"
              testID="groups-empty-join"
            />
          </Stack>
        }
      />
    );
  }
  return (
    <CardList>
      {groups.map(({ group, groupRole }) => (
        <ListRow
          key={group.id}
          icon="people-outline"
          label={group.name}
          description={groupSummary(
            group.id,
            groupRole === "ADMIN",
            joinRequestCounts,
          )}
          onPress={() => onOpenGroup(group.id)}
          testID={`group-row-${group.id}`}
        />
      ))}
    </CardList>
  );
}
