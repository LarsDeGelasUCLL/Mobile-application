import { controlSize } from "../../theme/tokens";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";
import { Stack } from "./Stack";

interface SkeletonLine {
  height: number;
  width?: number | `${number}%`;
}

interface SkeletonCardProps {
  /** Number of full-width touch-height lines, or the size of each line. */
  lines: number | readonly SkeletonLine[];
  testID?: string;
}

/** Loading placeholder: a card of skeleton lines. */
export function SkeletonCard({ lines, testID }: SkeletonCardProps) {
  const shape: readonly SkeletonLine[] =
    typeof lines === "number"
      ? Array.from({ length: lines }, () => ({ height: controlSize.touch }))
      : lines;
  return (
    <Card testID={testID}>
      <Stack gap="sm">
        {shape.map((line, index) => (
          <Skeleton key={index} height={line.height} width={line.width} />
        ))}
      </Stack>
    </Card>
  );
}
