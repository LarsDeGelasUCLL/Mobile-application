import type { ReactNode } from "react";
import {
  Card,
  Checkbox,
  EmptyState,
  Radio,
  Row,
  Stack,
  Text,
} from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import { participantLabel } from "../expenseParticipants";
import type { SplitMode } from "../expenseFormState";
import type { PublicUserProfileDto } from "../../../types";

interface SplitBetweenProps {
  participants: PublicUserProfileDto[];
  currentUserId: string;
  selectedUserIds: string[];
  splitMode: SplitMode;
  onToggle: (userId: string, selected: boolean) => void;
  onSplitModeChange: (mode: SplitMode) => void;
  /** The share rows, below the split-mode radios. */
  children?: ReactNode;
  testID?: string;
}

/** "Split between": participant checkboxes and equal/custom radios. */
export function SplitBetween({
  participants,
  currentUserId,
  selectedUserIds,
  splitMode,
  onToggle,
  onSplitModeChange,
  children,
  testID,
}: SplitBetweenProps) {
  const { t } = useI18n();
  return (
    <Card testID={testID}>
      <Stack gap="md">
        <Text size="md" weight="bold">
          {t("expenses.form.splitBetween")}
        </Text>
        {participants.length === 0 ? (
          <EmptyState
            title={t("expenses.noParticipants.title")}
            description={t("expenses.noParticipants.split")}
          />
        ) : (
          <Stack gap="sm">
            {participants.map((participant) => (
              <Checkbox
                key={participant.id}
                label={participantLabel(participant, currentUserId, t)}
                checked={selectedUserIds.includes(participant.id)}
                onChange={(selected) => onToggle(participant.id, selected)}
              />
            ))}
          </Stack>
        )}
        <Row gap="md" wrap>
          <Radio
            label={t("expenses.form.splitEqually")}
            value="equal"
            selected={splitMode === "equal"}
            onSelect={onSplitModeChange}
          />
          <Radio
            label={t("expenses.form.customAmounts")}
            value="custom"
            selected={splitMode === "custom"}
            onSelect={onSplitModeChange}
          />
        </Row>
        {children}
      </Stack>
    </Card>
  );
}
