import type { Meta, StoryObj } from '@storybook/react';
import { BalanceRow } from './BalanceRow';
import { CardFlatList, CardList } from './CardList';
import { ListRow } from './ListRow';

const meta: Meta<typeof CardList> = { title: 'Primitives/CardList', component: CardList };
export default meta;
type Story = StoryObj<typeof CardList>;

export const Rows: Story = {
  args: {
    children: [
      <ListRow key="profile" icon="person-outline" label="Edit profile" onPress={() => {}} />,
      <ListRow key="email" icon="mail-outline" label="Email" onPress={() => {}} />,
      <ListRow key="password" icon="lock-closed-outline" label="Password" onPress={() => {}} />,
    ],
  },
};
export const Padded: Story = {
  args: {
    variant: 'padded',
    children: [
      <BalanceRow key="you" name="You" amount={12.5} />,
      <BalanceRow key="sam" name="Sam" amount={-12.5} />,
    ],
  },
};

const people = ['Alex', 'Sam', 'Robin'];

export const FlatListVariant: Story = {
  render: () => (
    <CardFlatList
      data={people}
      keyExtractor={(name) => name}
      renderItem={({ item }) => <ListRow label={item} onPress={() => {}} />}
    />
  ),
};
