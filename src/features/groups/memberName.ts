import type { I18n } from "../../i18n";
import type { MembershipDto } from "../../types";

/** A member's display name, or "Group member" when the profile is missing. */
export function memberName(
  member: Pick<MembershipDto, "userProfile">,
  t: I18n["t"],
): string {
  return member.userProfile?.displayName ?? t("groups.memberFallback");
}
