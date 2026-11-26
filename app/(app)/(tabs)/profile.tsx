import { router } from "expo-router";
import { useAuthStore } from "../../../src/state/useAuthStore";
import {
  Avatar,
  Card,
  Divider,
  ListRow,
  MaskedValue,
  Screen,
  Stack,
  Text,
} from "../../../src/components/primitives";
import { useI18n } from "../../../src/i18n";

const editProfile = () => router.push("/settings/profile");

// Display only (design §6.5): every change happens in Settings.
export default function ProfileScreen() {
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);

  return (
    <Screen padding="lg" testID="profile-screen">
      <Stack gap="lg">
        <Stack gap="sm" align="center">
          <Avatar
            name={user?.displayName ?? user?.emailAddress ?? "U"}
            uri={user?.profilePictureUrl ?? undefined}
            size="lg"
          />
          <Text size="xl" weight="bold" align="center">
            {user?.displayName ?? t("profile.defaultName")}
          </Text>
          {user?.customBio ? (
            <Text tone="muted" align="center">
              {user.customBio}
            </Text>
          ) : null}
        </Stack>

        <Card flush>
          <ListRow
            icon="mail-outline"
            label={t("auth.field.email")}
            description={user?.emailAddress ?? ""}
            testID="profile-email"
          />
          <Divider />
          {user?.phoneNumber ? (
            <ListRow
              icon="call-outline"
              label={t("profile.phone")}
              description={user.phoneNumber}
              testID="profile-phone"
            />
          ) : (
            <ListRow
              icon="call-outline"
              label={t("profile.phone")}
              description={t("profile.addPhone")}
              onPress={editProfile}
              testID="profile-add-phone"
            />
          )}
        </Card>

        {user?.iban ? (
          <Card>
            <MaskedValue
              label={t("profile.ibanLong")}
              value={user.iban}
              testID="profile-iban"
            />
          </Card>
        ) : (
          <Card flush>
            <ListRow
              icon="card-outline"
              label={t("profile.iban")}
              description={t("profile.addIban")}
              onPress={editProfile}
              testID="profile-add-iban"
            />
          </Card>
        )}
      </Stack>
    </Screen>
  );
}
