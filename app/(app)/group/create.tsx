import { useEffect, useState } from "react";
import { router } from "expo-router";
import { goBackOr } from "../../../src/features/navigation/goBackOr";
import {
  FeedbackBanner,
  InputField,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
} from "../../../src/components/primitives";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import { validateGroupName } from "../../../src/features/groups/groupValidation";
import { useI18n, type TranslationKey } from "../../../src/i18n";

export default function CreateGroupScreen() {
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const createNewGroup = useGroupStore((state) => state.createNewGroup);
  const isLoading = useGroupStore((state) => state.isLoading);
  const storeError = useGroupStore((state) => state.error);
  const clearError = useGroupStore((state) => state.clearError);

  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupNameError, setGroupNameError] = useState<TranslationKey>();

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
          label={t("groups.create.submit")}
          onPress={() => void handleCreateGroup()}
          isLoading={isLoading}
          testID="create-group-button"
        />
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title={t("groups.create.title")}
          onBack={() => goBackOr("/groups")}
          testID="create-group-header"
        />
        <InputField
          label={t("groups.field.name")}
          value={groupName}
          onChangeText={(value) => {
            setGroupName(value);
            setGroupNameError(undefined);
          }}
          placeholder={t("groups.field.namePlaceholder")}
          error={groupNameError && t(groupNameError)}
          testID="create-group-name-input"
        />
        <InputField
          label={t("groups.field.descriptionOptional")}
          value={groupDescription}
          onChangeText={setGroupDescription}
          placeholder={t("groups.create.descriptionPlaceholder")}
          testID="create-group-description-input"
        />
        {storeError ? (
          <FeedbackBanner
            tone="error"
            message={storeError}
            testID="create-group-error"
          />
        ) : null}
      </Stack>
    </Screen>
  );
}
