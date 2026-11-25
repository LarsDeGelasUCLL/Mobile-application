import { SkeletonCard } from "../../../components/primitives";

/** Loading placeholder for the create and edit expense forms. */
export function ExpenseFormSkeleton({ testID }: { testID?: string }) {
  return (
    <SkeletonCard
      lines={[{ height: 24, width: "65%" }, { height: 48 }, { height: 48 }]}
      testID={testID}
    />
  );
}
