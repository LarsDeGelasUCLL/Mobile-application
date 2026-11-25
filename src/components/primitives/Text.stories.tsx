import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../../theme/ThemeProvider';
import type { Tone } from '../../theme/tone';

const meta: Meta<typeof Text> = { title: 'Primitives/Text', component: Text };
export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = { args: { children: 'The quick brown fox' } };
export const Small: Story = { args: { children: 'Small text', size: 'sm' } };
export const Large: Story = { args: { children: 'Large text', size: 'lg' } };
export const ExtraLarge: Story = { args: { children: 'XL heading', size: 'xl' } };
export const Bold: Story = { args: { children: 'Bold text', weight: 'bold' } };
export const Centered: Story = { args: { children: 'Centered text', align: 'center' } };

const onSurfaceTones: Tone[] = ['default', 'muted', 'primary', 'error', 'success', 'warning'];

function ToneList() {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      {onSurfaceTones.map((tone) => (
        <Text key={tone} tone={tone}>
          tone=&quot;{tone}&quot;
        </Text>
      ))}
      <View style={{ backgroundColor: colors.primary, padding: spacing.sm }}>
        <Text tone="onPrimary">tone=&quot;onPrimary&quot; (on a primary fill)</Text>
      </View>
      <View style={{ backgroundColor: colors.text, padding: spacing.sm }}>
        <Text tone="inverse">tone=&quot;inverse&quot; (on a text fill)</Text>
      </View>
    </View>
  );
}

export const Tones: Story = { render: () => <ToneList /> };
