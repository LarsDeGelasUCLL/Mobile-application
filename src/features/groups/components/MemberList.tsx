import {
  Avatar,
  CardList,
  ListRow,
  SectionHeader,
  SkeletonCard,
  Stack,
} from "../../../components/primitives";
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
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title="MEMBERS" count={members.length} />
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
                    name={memberName(member)}
                    uri={member.userProfile?.profilePictureUrl ?? undefined}
                    size="sm"
                  />
                }
                label={`${memberName(member)}${isCurrentUser ? " (you)" : ""}`}
                description={member.groupRole === "ADMIN" ? "Admin" : "Member"}
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
