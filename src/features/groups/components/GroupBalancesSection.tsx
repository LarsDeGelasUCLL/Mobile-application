import {
  BalanceRow,
  Card,
  CardList,
  EmptyState,
  SectionHeader,
  SkeletonCard,
  Stack,
  Text,
} from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import type { UserBalanceDto } from "../../../types";

interface GroupBalancesSectionProps {
  balances: UserBalanceDto[];
  /** Shown as "You". */
  currentUserId?: string;
  /** Balances for this group have arrived (an empty list is then real). */
  loaded: boolean;
  isLoading: boolean;
  /** The page shows the load error in its banner. */
  hasError: boolean;
  testID?: string;
}

/** "BALANCES": skeleton, loading note, empty state, or one row per member. */
export function GroupBalancesSection({
  testID,
  ...props
}: GroupBalancesSectionProps) {
  const { t } = useI18n();
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title={t("groups.balances.title")} />
      <BalancesBody {...props} />
    </Stack>
  );
}

/** The section's content for the current load state. */
function BalancesBody({
  balances,
  currentUserId,
  loaded,
  isLoading,
  hasError,
}: Omit<GroupBalancesSectionProps, "testID">) {
  const { t } = useI18n();
  if (hasError && balances.length === 0) return null;
  if (isLoading && balances.length === 0) {
    return (
      <SkeletonCard
        lines={[
          { height: 20, width: "60%" },
          { height: 18, width: "45%" },
        ]}
      />
    );
  }
  if (!loaded && !hasError) {
    return (
      <Card>
        <Text size="sm" tone="muted">
          {t("groups.balances.loading")}
        </Text>
      </Card>
    );
  }
  if (balances.length === 0) {
    return (
      <EmptyState
        icon="wallet-outline"
        title={t("groups.balances.emptyTitle")}
        description={t("groups.balances.emptyText")}
      />
    );
  }
  return (
    <CardList variant="padded">
      {balances.map((balance) => (
        <BalanceRow
          key={balance.userId}
          name={
            balance.userId === currentUserId
              ? t("common.you")
              : balance.displayName
          }
          amount={balance.netBalance}
          testID={`group-balance-${balance.userId}`}
        />
      ))}
    </CardList>
  );
}
