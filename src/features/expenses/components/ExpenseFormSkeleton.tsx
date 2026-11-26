import { SkeletonCard } from "../../../components/primitives";
import { controlSize } from "../../../theme/tokens";

/** Loading placeholder for the create and edit expense forms. */
export function ExpenseFormSkeleton({ testID }: { testID?: string }) {
  return (
    <SkeletonCard
      lines={[
        { height: 24, width: "65%" },
        { height: controlSize.control },
        { height: controlSize.control },
      ]}
      testID={testID}
    />
  );
}
