import {
  Avatar,
  CardList,
  ListRow,
  SectionHeader,
  SkeletonCard,
  Stack,
} from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import { memberName } from "../memberName";
import type { MembershipDto } from "../../../types";

interface MemberListProps {
  members: MembershipDto[];
  currentUserId: string | undefined;
  isLoading: boolean;
  /** Set for admins: tapping another member opens their actions. */
  onSelect?: (member: MembershipDto) => void;
  testID?: string;
}

/** "MEMBERS": one row per active member with their role. */
export function MemberList({
  members,
  currentUserId,
  isLoading,
  onSelect,
  testID,
}: MemberListProps) {
  const { t } = useI18n();
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title={t("groups.members.title")} count={members.length} />
      {isLoading && members.length === 0 ? (
        <SkeletonCard lines={2} />
      ) : (
        <CardList>
          {members.map((member) => {
            const isCurrentUser = member.userId === currentUserId;
            return (
              <ListRow
                key={member.id}
                leading={
                  <Avatar
                    name={memberName(member, t)}
                    uri={member.userProfile?.profilePictureUrl ?? undefined}
                    size="sm"
                  />
                }
                label={
                  isCurrentUser
                    ? t("common.nameYou", { name: memberName(member, t) })
                    : memberName(member, t)
                }
                description={t(
                  member.groupRole === "ADMIN"
                    ? "groups.role.admin"
                    : "groups.role.member",
                )}
                onPress={
                  onSelect && !isCurrentUser
                    ? () => onSelect(member)
                    : undefined
                }
                testID={`group-member-${member.id}`}
              />
            );
          })}
        </CardList>
      )}
    </Stack>
  );
}
