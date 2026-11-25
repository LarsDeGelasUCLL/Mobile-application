import type { UpdateUserProfileDto, User } from "../../types";

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

export type ProfileFieldErrors = Partial<
  Record<keyof ProfileFormValues, string>
>;

function isValidIban(iban: string): boolean {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;

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

  if (!displayName) errors.displayName = "Display name is required.";
  if (
    phoneNumber &&
    (phoneNumber.replace(/\D/g, "").length < 7 ||
      phoneNumber.replace(/\D/g, "").length > 15 ||
      !/^[+()\d\s.-]+$/.test(phoneNumber))
  ) {
    errors.phoneNumber = "Enter a valid phone number.";
  }
  if (iban && !isValidIban(iban)) errors.iban = "Enter a valid IBAN.";
  if (profilePictureUrl) {
    try {
      const url = new URL(profilePictureUrl);
      if (url.protocol !== "https:" || !url.hostname) {
        errors.profilePictureUrl = "Enter a valid HTTPS URL.";
      }
    } catch {
      errors.profilePictureUrl = "Enter a valid HTTPS URL.";
    }
  }
  if (customBio.length > 500) {
    errors.customBio = "Bio must be 500 characters or fewer.";
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
