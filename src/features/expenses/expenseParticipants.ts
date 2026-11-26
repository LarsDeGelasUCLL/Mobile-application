import type { I18n } from "../../i18n";
import type { PublicUserProfileDto, User } from "../../types";

function currentUserProfile(user: User): PublicUserProfileDto {
  return {
    id: user.id,
    displayName: user.displayName,
    profilePictureUrl: user.profilePictureUrl,
    customBio: user.customBio,
    recordCreated: user.recordCreated,
  };
}

/** The participants plus the current user (public fields only), each once, in order. */
export function includeCurrentUser(
  participants: PublicUserProfileDto[],
  user: User | null,
): PublicUserProfileDto[] {
  const merged = new Map(participants.map((profile) => [profile.id, profile]));
  if (user && !merged.has(user.id)) {
    merged.set(user.id, currentUserProfile(user));
  }
  return Array.from(merged.values());
}

/** A participant's name, with " (you)" for the current user. */
export function participantLabel(
  participant: PublicUserProfileDto,
  currentUserId: string,
  t: I18n["t"],
): string {
  return participant.id === currentUserId
    ? t("common.nameYou", { name: participant.displayName })
    : participant.displayName;
}
