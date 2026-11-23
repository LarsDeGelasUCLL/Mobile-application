import type {
  GroupDto,
  GroupRole,
  MembershipDto,
  MembershipStatus,
  PublicUserProfileDto,
} from "../../types";
import type { Database } from "../../types/database.types";

function parseGroupRole(value: unknown): GroupRole {
  if (value === "ADMIN" || value === "MEMBER") {
    return value;
  }
  throw new Error(`Unexpected membership role: ${String(value)}`);
}

function parseMembershipStatus(value: unknown): MembershipStatus {
  if (value === "ACTIVE" || value === "PENDING" || value === "REQUESTED") {
    return value;
  }
  throw new Error(`Unexpected membership status: ${String(value)}`);
}

export function mapRowToGroupDto(
  row: Database["public"]["Tables"]["groups"]["Row"],
): GroupDto {
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
  row: Database["public"]["Tables"]["memberships"]["Row"],
  profile?: PublicUserProfileDto,
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
