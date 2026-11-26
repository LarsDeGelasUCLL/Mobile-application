import { SkeletonCard } from "../../../components/primitives";

/** Loading placeholder for the expense detail summary. */
export function ExpenseDetailSkeleton({ testID }: { testID?: string }) {
  return (
    <SkeletonCard
      lines={[
        { height: 24, width: "65%" },
        { height: 18, width: "45%" },
        { height: 18, width: "80%" },
      ]}
      testID={testID}
    />
  );
}
