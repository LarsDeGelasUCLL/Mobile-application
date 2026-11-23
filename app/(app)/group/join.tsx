import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  FeedbackBanner,
  InputField,
  Screen,
  ScreenHeader,
  Stack,
  Text,
} from "../../../src/components/primitives";
import { StyledButton } from "../../../src/components/common/StyledButton";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import { validateInviteCode } from "../../../src/features/groups/groupValidation";
import { useTheme } from "../../../src/theme/ThemeProvider";

export default function JoinGroupScreen() {
  const { colors } = useTheme();
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
          onBack={() =>
            router.canGoBack() ? router.back() : router.replace("/groups")
          }
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
        <Text size="sm" color={colors.textMuted}>
          A group admin approves your request. If they already invited you, you
          join right away.
        </Text>
        {storeError ? (
          <FeedbackBanner tone="error" testID="join-group-error">
            <Text size="sm" color={colors.error}>
              {storeError}
            </Text>
          </FeedbackBanner>
        ) : null}
        {feedback ? (
          <FeedbackBanner tone="success" testID="join-group-feedback">
            <Text size="sm" color={colors.success}>
              {feedback}
            </Text>
          </FeedbackBanner>
        ) : null}
      </Stack>
    </Screen>
  );
}
