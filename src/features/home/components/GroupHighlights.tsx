import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Icon, Row, Stack, Text } from "../../../components/primitives";
import { GroupAvatar } from "../../groups/components/GroupAvatar";
import { colors } from "../../../theme/colors";

export interface GroupHighlight {
  id: string;
  name: string;
  imageUri?: string;
  fallbackColor?: string;
}

interface GroupHighlightsProps {
  groups: GroupHighlight[];
  onSeeAllPress: () => void;
  onGroupPress: (group: GroupHighlight) => void;
}

export function GroupHighlights({
  groups,
  onSeeAllPress,
  onGroupPress,
}: GroupHighlightsProps) {
  return (
    <Stack gap="sm">
      <Row justify="space-between" align="center">
        <Text size="md" weight="bold">
          Groups
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onSeeAllPress}
          hitSlop={8}
        >
          <Text size="sm" weight="medium" color={colors.primary}>
            See all
          </Text>
        </Pressable>
      </Row>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.groupList}
        testID="home-group-highlights"
      >
        {groups.map((group) => (
            <Pressable
              key={group.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${group.name}`}
              onPress={() => onGroupPress(group)}
              style={styles.groupItem}
            >
              <GroupAvatar
                name={group.name}
                imageUri={group.imageUri}
                fallbackColor={group.fallbackColor}
                size={58}
              />
              <Text size="sm" align="center" color={colors.muted}>
                {group.name}
              </Text>
            </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Browse groups"
          onPress={onSeeAllPress}
          style={styles.addGroup}
        >
          <View style={styles.addIcon}>
            <Icon name="add" size={23} color={colors.primary} />
          </View>
          <Text size="sm" align="center" color={colors.primary}>
            Find groups
          </Text>
        </Pressable>
      </ScrollView>
    </Stack>
  );
}

const styles = StyleSheet.create({
  groupList: {
    gap: 18,
    paddingVertical: 4,
  },
  groupItem: {
    width: 74,
    alignItems: "center",
    gap: 7,
  },
  addGroup: {
    width: 74,
    alignItems: "center",
    gap: 7,
  },
  addIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderStyle: "dashed",
  },
});
