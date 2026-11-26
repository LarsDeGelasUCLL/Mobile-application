import type { TranslationKey } from "../../i18n";
import { validateEmail } from "../auth/authValidation";

export function validateGroupName(name: string): TranslationKey | undefined {
  return name.trim() ? undefined : "validation.groupNameRequired";
}

export function validateInviteCode(code: string): TranslationKey | undefined {
  return code.trim() ? undefined : "validation.inviteCodeRequired";
}

export function validateInviteEmail(
  email: string,
): TranslationKey | undefined {
  return validateEmail(email);
}
