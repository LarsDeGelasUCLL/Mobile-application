import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackBanner } from './FeedbackBanner';

const meta: Meta<typeof FeedbackBanner> = {
  title: 'Primitives/FeedbackBanner',
  component: FeedbackBanner,
};
export default meta;
type Story = StoryObj<typeof FeedbackBanner>;

export const ErrorBanner: Story = {
  args: { tone: 'error', message: 'Could not load your groups.' },
};
export const SuccessBanner: Story = {
  args: { tone: 'success', message: 'Settings saved.' },
};
export const WarningBanner: Story = {
  args: { tone: 'warning', message: 'Offline support could not start.' },
};
export const WithRetry: Story = {
  args: {
    tone: 'error',
    message: 'Could not load your groups.',
    onRetry: () => {},
  },
};
export const Retrying: Story = {
  args: {
    tone: 'error',
    message: 'Could not load your groups.',
    onRetry: () => {},
    retryLabel: 'Retry groups',
    isRetrying: true,
  },
};
