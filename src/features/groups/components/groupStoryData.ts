import type {
  GroupDto,
  GroupInviteDto,
  GroupJoinRequestDto,
  MembershipDto,
  PublicUserProfileDto,
  UserBalanceDto,
  UserGroupDto,
} from "../../../types";

// Sample data for the group stories.
const profile = (id: string, displayName: string): PublicUserProfileDto => ({
  id,
  displayName,
  profilePictureUrl: null,
  customBio: null,
  recordCreated: "2026-01-01T12:00:00Z",
});

const membership = (
  id: string,
  userProfile: PublicUserProfileDto | undefined,
  groupRole: MembershipDto["groupRole"],
  status: MembershipDto["status"],
): MembershipDto => ({
  id,
  userId: userProfile?.id ?? `user-${id}`,
  groupId: "group-1",
  groupRole,
  status,
  invitedBy: null,
  joinedAt: "2026-03-14T19:30:00Z",
  userProfile,
});

export const storyGroup = {
  id: "group-1",
  name: "Weekend Ghent",
  description: "Trip costs for the weekend.",
};

export const storyMembers = [
  membership("m-sam", profile("sam", "Sam"), "ADMIN", "ACTIVE"),
  membership("m-ann", profile("ann", "Ann"), "MEMBER", "ACTIVE"),
  membership("m-bob", undefined, "MEMBER", "ACTIVE"),
];

export const storyJoinRequests = [
  membership("r-eve", profile("eve", "Eve"), "MEMBER", "REQUESTED"),
  membership("r-max", profile("max", "Max"), "MEMBER", "REQUESTED"),
];

const group = (id: string, name: string): GroupDto => ({
  id,
  name,
  description: null,
  inviteCode: "K7Q2-PX9M",
  groupIconUrl: null,
  createdBy: null,
  recordCreated: "2026-01-01T12:00:00Z",
});

export const storyFullGroup = group("group-1", "Weekend Ghent");

export const storyUserGroups: UserGroupDto[] = [
  {
    membershipId: "m-1",
    groupRole: "ADMIN",
    joinedAt: "2026-01-01T12:00:00Z",
    group: storyFullGroup,
  },
  {
    membershipId: "m-2",
    groupRole: "MEMBER",
    joinedAt: "2026-01-02T12:00:00Z",
    group: group("group-2", "Flat 3B"),
  },
];

export const storyJoinRequestCounts = { "group-1": 2 };

export const storyInvites: GroupInviteDto[] = [
  {
    membershipId: "i-1",
    joinedAt: "2026-03-14T19:30:00Z",
    group: group("group-3", "Ski trip"),
    invitedByProfile: profile("sam", "Sam"),
  },
  {
    membershipId: "i-2",
    joinedAt: "2026-03-15T19:30:00Z",
    group: group("group-4", "Book club"),
    invitedByProfile: null,
  },
];

export const storySentRequests: GroupJoinRequestDto[] = [
  {
    membershipId: "s-1",
    requestedAt: "2026-03-14T19:30:00Z",
    group: group("group-5", "Running club"),
  },
  {
    membershipId: "s-2",
    requestedAt: "2026-03-16T19:30:00Z",
    group: group("group-6", "Board games"),
  },
];

const balance = (
  userId: string,
  displayName: string,
  netBalance: number,
): UserBalanceDto => ({
  userId,
  displayName,
  totalPaid: 0,
  totalOwed: 0,
  netBalance,
});

export const storyBalances = [
  balance("sam", "Sam", 30),
  balance("ann", "Ann", -15),
  balance("bob", "Bob", -15),
];
