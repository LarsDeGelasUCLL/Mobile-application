import type { MembershipDto } from "../../types";

/** A member's display name, or "Group member" when the profile is missing. */
export function memberName(member: Pick<MembershipDto, "userProfile">): string {
  return member.userProfile?.displayName ?? "Group member";
}
