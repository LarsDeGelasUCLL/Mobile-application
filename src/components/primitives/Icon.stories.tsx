import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';

const meta: Meta<typeof Icon> = { title: 'Primitives/Icon', component: Icon };
export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = { args: { name: 'home' } };
export const Large: Story = { args: { name: 'settings', size: 32 } };
export const Toned: Story = { args: { name: 'heart', tone: 'error', size: 28 } };
