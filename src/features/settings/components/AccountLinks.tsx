import { router } from "expo-router";
import {
  Card,
  Divider,
  ListRow,
  SectionHeader,
  Stack,
} from "../../../components/primitives";

interface AccountLinksProps {
  /** Shown under "Email". */
  email?: string;
  testID?: string;
}

/** "ACCOUNT": rows to the profile, email and password pages. */
export function AccountLinks({ email, testID }: AccountLinksProps) {
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title="ACCOUNT" />
      <Card flush>
        <ListRow
          icon="person-outline"
          label="Edit profile"
          onPress={() => router.push("/settings/profile")}
          testID="settings-edit-profile"
        />
        <Divider />
        <ListRow
          icon="mail-outline"
          label="Email"
          description={email}
          onPress={() => router.push("/settings/email")}
          testID="settings-email"
        />
        <Divider />
        <ListRow
          icon="lock-closed-outline"
          label="Password"
          onPress={() => router.push("/settings/password")}
          testID="settings-password"
        />
      </Card>
    </Stack>
  );
}
