import { UserProfileDto } from ".";

export type GroupRole = "ADMIN" | "MEMBER";
export type MembershipStatus = "PENDING" | "ACTIVE";

// Response DTO: public.groups
export interface GroupDto {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  groupIconUrl: string | null;
  createdBy: string | null;
  recordCreated: string;
}

// Request DTO for creating a group
export interface CreateGroupDto {
  name: string;
  description?: string;
  groupIconUrl?: string;
}

// Response DTO: public.memberships
export interface MembershipDto {
  id: string;
  userId: string;
  groupId: string;
  groupRole: GroupRole;
  status: MembershipStatus;
  invitedBy: string | null;
  joinedAt: string;
  userProfile?: UserProfileDto;
}

// Response DTO for the list of groups a user is an active member of
export interface UserGroupDto {
  membershipId: string;
  groupRole: GroupRole;
  joinedAt: string;
  group: GroupDto;
}

// Response DTO for an open invitation in the Inbox
export interface GroupInviteDto {
  membershipId: string;
  joinedAt: string;
  group: GroupDto;
  invitedByProfile: UserProfileDto | null;
}
