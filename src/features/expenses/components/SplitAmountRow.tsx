import { View } from "react-native";
import { InputField, Text } from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import { makeStyles } from "../../../theme/ThemeProvider";

interface SplitAmountRowProps {
  name: string;
  amount: string;
  /** Only custom amounts can be typed in. */
  editable: boolean;
  onChangeAmount: (value: string) => void;
  /** Goes on the amount input, the row's only control. */
  testID?: string;
}

/** One participant's share: name and amount input. */
export function SplitAmountRow({
  name,
  amount,
  editable,
  onChangeAmount,
  testID,
}: SplitAmountRowProps) {
  const { t } = useI18n();
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Text size="sm" weight="medium">
        {name}
      </Text>
      <View style={styles.amount}>
        <InputField
          label={t("expenses.form.share")}
          value={amount}
          onChangeText={onChangeAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          editable={editable}
          testID={testID}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.md,
  },
  amount: {
    flex: 1,
  },
}));
