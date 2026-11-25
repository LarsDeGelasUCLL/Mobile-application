import { Children } from "react";
import { FlatList, type FlatListProps } from "react-native";
import { Card } from "./Card";
import { Divider } from "./Divider";
import { makeStyles } from "../../theme/ThemeProvider";

interface CardListProps {
  /** One item per child; `null`/`false` children are skipped. */
  children: React.ReactNode;
  /** `flush` (default): rows edge to edge (`ListRow`). `padded`: card padding (`BalanceRow`). */
  variant?: "flush" | "padded";
  testID?: string;
}

/** A card with a `Divider` between its items. */
export function CardList({
  children,
  variant = "flush",
  testID,
}: CardListProps) {
  const items = Children.toArray(children);
  return (
    <Card flush={variant === "flush"} testID={testID}>
      {items.flatMap((item, index) =>
        index === 0 ? [item] : [<Divider key={`divider-${index}`} />, item],
      )}
    </Card>
  );
}

/** `FlatList` with the `CardList` look: card border while it has items, `Divider` between rows. */
export function CardFlatList<T>({ style, ...props }: FlatListProps<T>) {
  const styles = useStyles();
  const hasItems = (props.data?.length ?? 0) > 0;
  return (
    <FlatList
      ItemSeparatorComponent={Divider}
      {...props}
      style={[hasItems && styles.list, style]}
    />
  );
}

const useStyles = makeStyles((t) => ({
  // flexGrow 0 so a short list does not stretch the border.
  list: {
    flexGrow: 0,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
}));
