import type {
  GroupDto,
  GroupRole,
  MembershipDto,
  MembershipStatus,
  UserProfileDto,
} from "../../types";

function parseGroupRole(value: unknown): GroupRole {
  return value === "ADMIN" ? "ADMIN" : "MEMBER";
}

function parseMembershipStatus(value: unknown): MembershipStatus {
  return value === "ACTIVE" ? "ACTIVE" : "PENDING";
}

export function mapRowToGroupDto(row: Record<string, unknown>): GroupDto {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    description: typeof row.description === "string" ? row.description : null,
    inviteCode: String(row.invite_code ?? ""),
    groupIconUrl:
      typeof row.group_icon_url === "string" ? row.group_icon_url : null,
    createdBy: typeof row.created_by === "string" ? row.created_by : null,
    recordCreated: String(row.record_created ?? ""),
  };
}

export function mapRowToMembershipDto(
  row: Record<string, unknown>,
  profile?: UserProfileDto,
): MembershipDto {
  return {
    id: String(row.id ?? ""),
    userId: String(row.user_id ?? ""),
    groupId: String(row.group_id ?? ""),
    groupRole: parseGroupRole(row.group_role),
    status: parseMembershipStatus(row.status),
    invitedBy: typeof row.invited_by === "string" ? row.invited_by : null,
    joinedAt: String(row.joined_at ?? ""),
    userProfile: profile,
  };
}
