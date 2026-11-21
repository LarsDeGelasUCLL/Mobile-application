import { validateEmail } from "../auth/authValidation";

export function validateGroupName(name: string): string | undefined {
  return name.trim() ? undefined : "Group name is required.";
}

export function validateInviteCode(code: string): string | undefined {
  return code.trim() ? undefined : "Invite code is required.";
}

export function validateInviteEmail(email: string): string | undefined {
  return validateEmail(email);
}
