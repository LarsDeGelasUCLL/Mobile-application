import { useState } from "react";
import {
  CollapsibleSection,
  InputField,
  StyledButton,
} from "../../../components/primitives";
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
  // The fields remount, not the section, so it stays open after a save.
  return (
    <CollapsibleSection title="Group info" testID={testID}>
      <GroupInfoFields
        key={`${group.id}:${group.name}:${group.description ?? ""}`}
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
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [nameError, setNameError] = useState<string>();

  const save = () => {
    const validationError = validateGroupName(name);
    setNameError(validationError);
    if (validationError) return;
    onSave(name, description);
  };

  return (
    <>
      <InputField
        label="Group name"
        value={name}
        onChangeText={(value) => {
          setName(value);
          setNameError(undefined);
        }}
        error={nameError}
        testID="group-name-input"
      />
      <InputField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Add a short description"
        testID="group-description-input"
      />
      <StyledButton
        label="Save changes"
        onPress={save}
        variant="secondary"
        isLoading={isLoading}
        testID="update-group-button"
      />
    </>
  );
}
