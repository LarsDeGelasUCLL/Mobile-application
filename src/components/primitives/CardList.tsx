import { Children } from "react";
import { Card } from "./Card";
import { Divider } from "./Divider";

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
