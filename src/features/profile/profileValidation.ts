import type { TranslationKey } from "../../i18n";
import type { UpdateUserProfileDto, User } from "../../types";

/** The edit-profile form as typed (all text; empty = not set). */
export interface ProfileFormValues {
  displayName: string;
  phoneNumber: string;
  iban: string;
  profilePictureUrl: string;
  customBio: string;
}

/** The edit-profile fields for `user`; empty text without a user or value. */
export function profileFormValues(
  user: Pick<User, keyof ProfileFormValues> | null,
): ProfileFormValues {
  return {
    displayName: user?.displayName ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    iban: user?.iban ?? "",
    profilePictureUrl: user?.profilePictureUrl ?? "",
    customBio: user?.customBio ?? "",
  };
}

/** The edit-profile form's remount key: changes whenever a save lands, the
 * user changes or a stored value changes, so the form re-seeds. */
export function profileFormKey(
  savedCount: number,
  userId: string,
  values: ProfileFormValues,
): string {
  return JSON.stringify([savedCount, userId, ...Object.values(values)]);
}

/** A dictionary key per invalid field. */
export type ProfileFieldErrors = Partial<
  Record<keyof ProfileFormValues, TranslationKey>
>;

/** IBAN shape plus the ISO 13616 mod-97 checksum (letters count as 10-35). */
function isValidIban(iban: string): boolean {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;

  // Move the country code and check digits to the end, then take the number
  // mod 97 digit by digit (it is too big for a JS number).
  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;
  let remainder = 0;
  for (const character of rearranged) {
    const digits =
      character >= "A" && character <= "Z"
        ? String(character.charCodeAt(0) - 55)
        : character;
    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }
  return remainder === 1;
}

/**
 * Normalises the form (trim, IBAN without spaces and upper case, empty ->
 * `null`) and checks it. Save only when `errors` is empty.
 */
export function validateProfile(values: ProfileFormValues): {
  values: UpdateUserProfileDto;
  errors: ProfileFieldErrors;
} {
  const displayName = values.displayName.trim();
  const phoneNumber = values.phoneNumber.trim();
  const iban = values.iban.replace(/\s+/g, "").toUpperCase();
  const profilePictureUrl = values.profilePictureUrl.trim();
  const customBio = values.customBio.trim();
  const errors: ProfileFieldErrors = {};

  if (!displayName) errors.displayName = "validation.displayNameRequired";
  if (
    phoneNumber &&
    (phoneNumber.replace(/\D/g, "").length < 7 ||
      phoneNumber.replace(/\D/g, "").length > 15 ||
      !/^[+()\d\s.-]+$/.test(phoneNumber))
  ) {
    errors.phoneNumber = "validation.phoneInvalid";
  }
  if (iban && !isValidIban(iban)) errors.iban = "validation.ibanInvalid";
  if (profilePictureUrl) {
    try {
      const url = new URL(profilePictureUrl);
      if (url.protocol !== "https:" || !url.hostname) {
        errors.profilePictureUrl = "validation.httpsUrlInvalid";
      }
    } catch {
      errors.profilePictureUrl = "validation.httpsUrlInvalid";
    }
  }
  if (customBio.length > 500) {
    errors.customBio = "validation.bioTooLong";
  }

  return {
    values: {
      displayName,
      phoneNumber: phoneNumber || null,
      iban: iban || null,
      profilePictureUrl: profilePictureUrl || null,
      customBio: customBio || null,
    },
    errors,
  };
}
