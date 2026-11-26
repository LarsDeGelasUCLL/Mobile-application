import {
  CollapsibleSection,
  Divider,
  Stack,
  StyledButton,
  Text,
} from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import type { GroupJoinRequestDto } from "../../../types";
import { formatDate } from "../../../utils/dates";

interface SentRequestListProps {
  requests: GroupJoinRequestDto[];
  isLoading: boolean;
  onCancel: (membershipId: string) => void;
  testID?: string;
}

/** "Sent join requests" (collapsed): cancel per request; nothing when there are none. */
export function SentRequestList({
  requests,
  isLoading,
  onCancel,
  testID,
}: SentRequestListProps) {
  const { locale } = useI18n();
  if (requests.length === 0) return null;
  // Not `CardList`: each request keeps a gap above and below its divider.
  return (
    <CollapsibleSection
      title="Sent join requests"
      count={requests.length}
      testID={testID}
    >
      {requests.map((request, index) => (
        <Stack gap="sm" key={request.membershipId}>
          {index > 0 && <Divider />}
          <Text weight="bold">{request.group.name}</Text>
          <Text size="sm" tone="muted">
            Requested {formatDate(request.requestedAt, locale)}
          </Text>
          <StyledButton
            label="Cancel request"
            onPress={() => onCancel(request.membershipId)}
            variant="secondary"
            isLoading={isLoading}
            testID={`sent-request-cancel-${request.membershipId}`}
          />
        </Stack>
      ))}
    </CollapsibleSection>
  );
}
