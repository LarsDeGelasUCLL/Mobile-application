import type { MembershipDto, PublicUserProfileDto } from "../../../types";

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
