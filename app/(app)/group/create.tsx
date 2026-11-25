import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  FeedbackBanner,
  InputField,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
  Text,
} from "../../../src/components/primitives";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import { validateGroupName } from "../../../src/features/groups/groupValidation";

export default function CreateGroupScreen() {
  const user = useAuthStore((state) => state.user);
  const createNewGroup = useGroupStore((state) => state.createNewGroup);
  const isLoading = useGroupStore((state) => state.isLoading);
  const storeError = useGroupStore((state) => state.error);
  const clearError = useGroupStore((state) => state.clearError);

  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupNameError, setGroupNameError] = useState<string>();

  // A failed create must not leave its error on the Groups list.
  useEffect(() => clearError, [clearError]);

  const handleCreateGroup = async () => {
    const validationError = validateGroupName(groupName);
    setGroupNameError(validationError);
    clearError();
    if (validationError || !user?.id) return;

    try {
      const group = await createNewGroup(user.id, {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
      });
      router.replace({
        pathname: "/group/[groupId]",
        params: { groupId: group.id },
      });
    } catch {
      // The store holds the message; it renders below.
    }
  };

  return (
    <Screen
      padding="lg"
      footer={
        <StyledButton
          label="Create group"
          onPress={() => void handleCreateGroup()}
          isLoading={isLoading}
          testID="create-group-button"
        />
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title="Create group"
          onBack={() =>
            router.canGoBack() ? router.back() : router.replace("/groups")
          }
          testID="create-group-header"
        />
        <InputField
          label="Group name"
          value={groupName}
          onChangeText={(value) => {
            setGroupName(value);
            setGroupNameError(undefined);
          }}
          placeholder="Weekend trip"
          error={groupNameError}
          testID="create-group-name-input"
        />
        <InputField
          label="Description (optional)"
          value={groupDescription}
          onChangeText={setGroupDescription}
          placeholder="What are you planning together?"
          testID="create-group-description-input"
        />
        {storeError ? (
          <FeedbackBanner tone="error" testID="create-group-error">
            <Text size="sm" tone="error">
              {storeError}
            </Text>
          </FeedbackBanner>
        ) : null}
      </Stack>
    </Screen>
  );
}
