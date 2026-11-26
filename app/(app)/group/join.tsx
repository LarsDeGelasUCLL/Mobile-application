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
import { useI18n, type TranslationKey } from "../../../src/i18n";

/** Join a group with an invite code (`/group/join`). */
export default function JoinGroupScreen() {
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const joinByCode = useGroupStore((state) => state.joinByCode);
  const isLoading = useGroupStore((state) => state.isLoading);
  const storeError = useGroupStore((state) => state.error);
  const clearError = useGroupStore((state) => state.clearError);

  const [inviteCode, setInviteCode] = useState("");
  const [inviteCodeError, setInviteCodeError] = useState<TranslationKey>();
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
      setFeedback(t("groups.join.requestSent"));
    } catch {
      // The store holds the message; it renders below.
    }
  };

  return (
    <Screen
      padding="lg"
      footer={
        <StyledButton
          label={t("groups.join.submit")}
          onPress={() => void handleJoinGroup()}
          isLoading={isLoading}
          testID="join-group-button"
        />
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title={t("groups.join.title")}
          onBack={() => goBackOr("/groups")}
          testID="join-group-header"
        />
        <InputField
          label={t("groups.join.codeLabel")}
          value={inviteCode}
          onChangeText={(value) => {
            setInviteCode(value);
            setInviteCodeError(undefined);
          }}
          placeholder={t("groups.join.codePlaceholder")}
          error={inviteCodeError && t(inviteCodeError)}
          testID="join-group-code-input"
        />
        <Text size="sm" tone="muted">
          {t("groups.join.hint")}
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
