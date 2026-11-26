import {
  CardList,
  EmptyState,
  ListRow,
  SectionHeader,
  SkeletonCard,
  Stack,
  StyledButton,
} from "../../../components/primitives";
import { useI18n } from "../../../i18n";
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
  const { t } = useI18n();
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title={t("groups.list.title")} />
      <GroupListBody {...props} />
    </Stack>
  );
}

/** The list's content for the current load state. */
function GroupListBody({
  groups,
  joinRequestCounts,
  isLoading,
  hasError,
  onOpenGroup,
  onCreate,
  onJoin,
}: Omit<GroupListProps, "testID">) {
  const { t } = useI18n();
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
        title={t("groups.list.emptyTitle")}
        description={t("groups.list.emptyText")}
        action={
          <Stack gap="sm">
            <StyledButton
              label={t("groups.create.title")}
              onPress={onCreate}
              testID="groups-empty-create"
            />
            <StyledButton
              label={t("groups.join.title")}
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
            t,
          )}
          onPress={() => onOpenGroup(group.id)}
          testID={`group-row-${group.id}`}
        />
      ))}
    </CardList>
  );
}
