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
  Text,
} from "../../../src/components/primitives";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import { validateInviteCode } from "../../../src/features/groups/groupValidation";

export default function JoinGroupScreen() {
  const user = useAuthStore((state) => state.user);
  const joinByCode = useGroupStore((state) => state.joinByCode);
  const isLoading = useGroupStore((state) => state.isLoading);
  const storeError = useGroupStore((state) => state.error);
  const clearError = useGroupStore((state) => state.clearError);

  const [inviteCode, setInviteCode] = useState("");
  const [inviteCodeError, setInviteCodeError] = useState<string>();
  const [feedback, setFeedback] = useState("");

  // A failed join must not leave its error on the Groups list.
  useEffect(() => clearError, [clearError]);

  const handleJoinGroup = async () => {
    const validationError = validateInviteCode(inviteCode);
    setInviteCodeError(validationError);
    setFeedback("");
    clearError();
    if (validationError || !user?.id) return;

    try {
      const { group, status } = await joinByCode(user.id, inviteCode.trim());
      if (status === "ACTIVE") {
        // An earlier email invite makes the join instant: open the group.
        router.replace({
          pathname: "/group/[groupId]",
          params: { groupId: group.id },
        });
        return;
      }
      setInviteCode("");
      setFeedback("Request sent. A group admin must approve it.");
    } catch {
      // The store holds the message; it renders below.
    }
  };

  return (
    <Screen
      padding="lg"
      footer={
        <StyledButton
          label="Send join request"
          onPress={() => void handleJoinGroup()}
          isLoading={isLoading}
          testID="join-group-button"
        />
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title="Join with code"
          onBack={() => goBackOr("/groups")}
          testID="join-group-header"
        />
        <InputField
          label="Invite code"
          value={inviteCode}
          onChangeText={(value) => {
            setInviteCode(value);
            setInviteCodeError(undefined);
          }}
          placeholder="Enter your invite code"
          error={inviteCodeError}
          testID="join-group-code-input"
        />
        <Text size="sm" tone="muted">
          A group admin approves your request. If they already invited you, you
          join right away.
        </Text>
        {storeError ? (
          <FeedbackBanner
            tone="error"
            message={storeError}
            testID="join-group-error"
          />
        ) : null}
        {feedback ? (
          <FeedbackBanner
            tone="success"
            message={feedback}
            testID="join-group-feedback"
          />
        ) : null}
      </Stack>
    </Screen>
  );
}
