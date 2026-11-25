import {
  Card,
  Divider,
  ListRow,
  SectionHeader,
  Stack,
} from "../../../components/primitives";

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
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title="ACCOUNT" />
      <Card flush>
        <ListRow
          icon="person-outline"
          label="Edit profile"
          onPress={() => onOpen("/settings/profile")}
          testID="settings-edit-profile"
        />
        <Divider />
        <ListRow
          icon="mail-outline"
          label="Email"
          description={email}
          onPress={() => onOpen("/settings/email")}
          testID="settings-email"
        />
        <Divider />
        <ListRow
          icon="lock-closed-outline"
          label="Password"
          onPress={() => onOpen("/settings/password")}
          testID="settings-password"
        />
      </Card>
    </Stack>
  );
}
