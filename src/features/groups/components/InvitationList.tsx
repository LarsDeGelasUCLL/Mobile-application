import { View } from "react-native";
import {
  CollapsibleSection,
  Divider,
  Row,
  Stack,
  StyledButton,
  Text,
} from "../../../components/primitives";
import type { GroupInviteDto } from "../../../types";
import { makeStyles } from "../../../theme/ThemeProvider";

interface InvitationListProps {
  invites: GroupInviteDto[];
  isLoading: boolean;
  onRespond: (membershipId: string, accept: boolean) => void;
  testID?: string;
}

/** "Invitations" (collapsed): accept / decline per invite; nothing when there are none. */
export function InvitationList({
  invites,
  isLoading,
  onRespond,
  testID,
}: InvitationListProps) {
  const styles = useStyles();
  if (invites.length === 0) return null;
  // Not `CardList`: each invite keeps a gap above and below its divider.
  return (
    <CollapsibleSection
      title="Invitations"
      count={invites.length}
      testID={testID}
    >
      {invites.map((invite, index) => (
        <Stack gap="sm" key={invite.membershipId}>
          {index > 0 && <Divider />}
          <Text weight="bold">{invite.group.name}</Text>
          <Text size="sm" tone="muted">
            {invite.invitedByProfile
              ? `Invited by ${invite.invitedByProfile.displayName}`
              : "You have been invited to this group."}
          </Text>
          <Row gap="sm">
            <View style={styles.buttonColumn}>
              <StyledButton
                label="Accept"
                onPress={() => onRespond(invite.membershipId, true)}
                variant="secondary"
                isLoading={isLoading}
                testID={`accept-invite-${invite.membershipId}`}
              />
            </View>
            <View style={styles.buttonColumn}>
              <StyledButton
                label="Decline"
                onPress={() => onRespond(invite.membershipId, false)}
                variant="secondary"
                isLoading={isLoading}
                testID={`decline-invite-${invite.membershipId}`}
              />
            </View>
          </Row>
        </Stack>
      ))}
    </CollapsibleSection>
  );
}

const useStyles = makeStyles(() => ({
  buttonColumn: { flex: 1 },
}));
