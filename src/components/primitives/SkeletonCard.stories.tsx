import type { Meta, StoryObj } from '@storybook/react';
import { SkeletonCard } from './SkeletonCard';

const meta: Meta<typeof SkeletonCard> = {
  title: 'Primitives/SkeletonCard',
  component: SkeletonCard,
};
export default meta;
type Story = StoryObj<typeof SkeletonCard>;

export const TwoLines: Story = { args: { lines: 2 } };
export const TitleAndText: Story = {
  args: {
    lines: [
      { height: 22, width: '60%' },
      { height: 16, width: '85%' },
    ],
  },
};
