import { useState } from "react";
import {
  CollapsibleSection,
  InputField,
  StyledButton,
} from "../../../components/primitives";
import { useI18n, type TranslationKey } from "../../../i18n";
import { validateGroupName } from "../groupValidation";
import type { GroupDto } from "../../../types";

interface GroupInfoFormProps {
  group: Pick<GroupDto, "id" | "name" | "description">;
  isLoading: boolean;
  /** Gets the validated fields. */
  onSave: (name: string, description: string) => void;
  testID?: string;
}

/** "Group info": edit the group name and description (admins). */
export function GroupInfoForm({ group, testID, ...props }: GroupInfoFormProps) {
  const { t } = useI18n();
  // The fields remount, not the section, so it stays open after a save.
  return (
    <CollapsibleSection title={t("groups.info.title")} testID={testID}>
      <GroupInfoFields
        key={JSON.stringify([group.id, group.name, group.description ?? ""])}
        group={group}
        {...props}
      />
    </CollapsibleSection>
  );
}

/** Seeds its state from `group`; the key above re-seeds it whenever the
 * stored group changes (a save, a refresh). */
function GroupInfoFields({
  group,
  isLoading,
  onSave,
}: Omit<GroupInfoFormProps, "testID">) {
  const { t } = useI18n();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [nameError, setNameError] = useState<TranslationKey>();

  const save = () => {
    const validationError = validateGroupName(name);
    setNameError(validationError);
    if (validationError) return;
    onSave(name, description);
  };

  return (
    <>
      <InputField
        label={t("groups.field.name")}
        value={name}
        onChangeText={(value) => {
          setName(value);
          setNameError(undefined);
        }}
        error={nameError && t(nameError)}
        testID="group-name-input"
      />
      <InputField
        label={t("groups.field.description")}
        value={description}
        onChangeText={setDescription}
        placeholder={t("groups.field.descriptionPlaceholder")}
        testID="group-description-input"
      />
      <StyledButton
        label={t("groups.info.save")}
        onPress={save}
        variant="secondary"
        isLoading={isLoading}
        testID="update-group-button"
      />
    </>
  );
}
