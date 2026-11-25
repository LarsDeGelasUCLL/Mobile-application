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
  return (
    <Card testID={testID}>
      <Stack gap="md">
        <Text size="md" weight="bold">
          Split between
        </Text>
        {participants.length === 0 ? (
          <EmptyState
            title="No participants available"
            description="Add an active group member or use someone from your personal expense history."
          />
        ) : (
          <Stack gap="sm">
            {participants.map((participant) => (
              <Checkbox
                key={participant.id}
                label={participantLabel(participant, currentUserId)}
                checked={selectedUserIds.includes(participant.id)}
                onChange={(selected) => onToggle(participant.id, selected)}
              />
            ))}
          </Stack>
        )}
        <Row gap="md" wrap>
          <Radio
            label="Split equally"
            value="equal"
            selected={splitMode === "equal"}
            onSelect={onSplitModeChange}
          />
          <Radio
            label="Custom amounts"
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
