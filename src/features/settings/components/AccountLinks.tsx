import {
  Card,
  Divider,
  ListRow,
  SectionHeader,
  Stack,
} from "../../../components/primitives";
import { useI18n } from "../../../i18n";

/** The pages the rows open. */
export type AccountHref =
  "/settings/profile" | "/settings/email" | "/settings/password";

interface AccountLinksProps {
  /** Shown under "Email". */
  email?: string;
  /** Gets the pressed row's page; the page routes to it. */
  onOpen: (href: AccountHref) => void;
  testID?: string;
}

/** "ACCOUNT": rows to the profile, email and password pages. */
export function AccountLinks({ email, onOpen, testID }: AccountLinksProps) {
  const { t } = useI18n();
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title={t("settings.account.title")} />
      <Card flush>
        <ListRow
          icon="person-outline"
          label={t("profile.edit.title")}
          onPress={() => onOpen("/settings/profile")}
          testID="settings-edit-profile"
        />
        <Divider />
        <ListRow
          icon="mail-outline"
          label={t("auth.field.email")}
          description={email}
          onPress={() => onOpen("/settings/email")}
          testID="settings-email"
        />
        <Divider />
        <ListRow
          icon="lock-closed-outline"
          label={t("auth.field.password")}
          onPress={() => onOpen("/settings/password")}
          testID="settings-password"
        />
      </Card>
    </Stack>
  );
}
