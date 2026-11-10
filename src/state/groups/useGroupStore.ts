import { create } from "zustand";
import { createGroupInviteActions } from "./groupInviteActions";
import { createGroupLoadActions } from "./groupLoadActions";
import { createGroupManagementActions } from "./groupManagementActions";
import type { GroupState } from "./groupStoreTypes";

export const useGroupStore = create<GroupState>()((...args) => ({
  groups: [],
  pendingInvites: [],
  activeGroupMembers: [],
  selectedGroupId: null,
  isLoading: false,
  error: null,
  ...createGroupLoadActions(...args),
  ...createGroupInviteActions(...args),
  ...createGroupManagementActions(...args),
}));
