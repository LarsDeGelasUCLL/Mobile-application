import { useState } from "react";
import {
  CollapsibleSection,
  InputField,
  StyledButton,
} from "../../../components/primitives";
import { validateGroupName } from "../groupValidation";
import type { GroupDto } from "../../../types";

interface GroupInfoFormProps {
  /** Seeds the fields once; give the form `key={group.id}` to reset it. */
  group: Pick<GroupDto, "name" | "description">;
  isLoading: boolean;
  /** Gets the validated fields; resolves whether the save succeeded. */
  onSave: (name: string, description: string) => Promise<boolean>;
  testID?: string;
}

/** "Group info": edit the group name and description (admins). */
export function GroupInfoForm({
  group,
  isLoading,
  onSave,
  testID,
}: GroupInfoFormProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description ?? "");
  const [nameError, setNameError] = useState<string>();

  const save = async () => {
    const validationError = validateGroupName(name);
    setNameError(validationError);
    if (validationError) return;
    // Show the trimmed values the store saved.
    if (await onSave(name, description)) {
      setName(name.trim());
      setDescription(description.trim());
    }
  };

  return (
    <CollapsibleSection title="Group info" testID={testID}>
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
        onPress={() => void save()}
        variant="secondary"
        isLoading={isLoading}
        testID="update-group-button"
      />
    </CollapsibleSection>
  );
}
