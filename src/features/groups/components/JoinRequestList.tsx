import { View } from "react-native";
import {
  Avatar,
  Card,
  Divider,
  Row,
  SectionHeader,
  Stack,
  StyledButton,
  Text,
} from "../../../components/primitives";
import { memberName } from "../memberName";
import type { MembershipDto } from "../../../types";
import { makeStyles } from "../../../theme/ThemeProvider";

interface JoinRequestListProps {
  requests: MembershipDto[];
  isLoading: boolean;
  onRespond: (membershipId: string, approve: boolean) => void;
  testID?: string;
}

/** "JOIN REQUESTS": one card, an approve/reject pair per request (admins). */
export function JoinRequestList({
  requests,
  isLoading,
  onRespond,
  testID,
}: JoinRequestListProps) {
  const styles = useStyles();
  // Not `CardList`: each request keeps a gap above and below its divider.
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title="JOIN REQUESTS" count={requests.length} />
      <Card>
        <Stack gap="md">
          {requests.map((request, index) => (
            <Stack gap="sm" key={request.id}>
              {index > 0 && <Divider />}
              <Row gap="sm" align="center">
                <Avatar
                  name={memberName(request)}
                  uri={request.userProfile?.profilePictureUrl ?? undefined}
                  size="sm"
                />
                <Stack gap="none" flex={1}>
                  <Text weight="medium">{memberName(request)}</Text>
                  <Text size="sm" tone="muted">
                    Requested {new Date(request.joinedAt).toLocaleDateString()}
                  </Text>
                </Stack>
              </Row>
              <Row gap="sm">
                <View style={styles.buttonColumn}>
                  <StyledButton
                    label="Approve"
                    onPress={() => onRespond(request.id, true)}
                    variant="secondary"
                    isLoading={isLoading}
                    testID={`join-request-approve-${request.id}`}
                  />
                </View>
                <View style={styles.buttonColumn}>
                  <StyledButton
                    label="Reject"
                    onPress={() => onRespond(request.id, false)}
                    variant="secondary"
                    isLoading={isLoading}
                    testID={`join-request-reject-${request.id}`}
                  />
                </View>
              </Row>
            </Stack>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}

const useStyles = makeStyles(() => ({
  buttonColumn: { flex: 1 },
}));
