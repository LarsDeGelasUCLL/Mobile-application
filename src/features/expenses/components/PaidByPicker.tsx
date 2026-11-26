import { Card, Radio, Stack, Text } from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import { participantLabel } from "../expenseParticipants";
import type { PublicUserProfileDto } from "../../../types";

interface PaidByPickerProps {
  participants: PublicUserProfileDto[];
  currentUserId: string;
  paidByUserId: string;
  onSelect: (userId: string) => void;
  testID?: string;
}

/** "Paid by": one radio per participant. */
export function PaidByPicker({
  participants,
  currentUserId,
  paidByUserId,
  onSelect,
  testID,
}: PaidByPickerProps) {
  const { t } = useI18n();
  return (
    <Card testID={testID}>
      <Stack gap="sm">
        <Text size="md" weight="bold">
          {t("expenses.form.paidBy")}
        </Text>
        {participants.map((participant) => (
          <Radio
            key={participant.id}
            label={participantLabel(participant, currentUserId, t)}
            value={participant.id}
            selected={paidByUserId === participant.id}
            onSelect={onSelect}
          />
        ))}
      </Stack>
    </Card>
  );
}
