import { create } from "zustand";
import { createGroupInviteActions } from "./groupInviteActions";
import { createGroupJoinRequestActions } from "./groupJoinRequestActions";
import { createGroupLoadActions } from "./groupLoadActions";
import { createGroupManagementActions } from "./groupManagementActions";
import type { GroupState } from "./groupStoreTypes";

export const useGroupStore = create<GroupState>()((...args) => ({
  groups: [],
  pendingInvites: [],
  activeGroupMembers: [],
  joinRequests: [],
  sentJoinRequests: [],
  joinRequestCounts: {},
  selectedGroupId: null,
  isLoading: false,
  error: null,
  ...createGroupLoadActions(...args),
  ...createGroupInviteActions(...args),
  ...createGroupJoinRequestActions(...args),
  ...createGroupManagementActions(...args),
}));
