import { Pressable, ScrollView, View } from "react-native";
import { Icon, Text } from "../../../components/primitives";
import { GroupAvatar } from "../../groups/components/GroupAvatar";
import { makeStyles, useTheme } from "../../../theme/ThemeProvider";
import type { GroupHighlight } from "../../../types";

interface GroupHighlightsProps {
  groups: GroupHighlight[];
  onSeeAllPress: () => void;
  onGroupPress: (group: GroupHighlight) => void;
}

/** Horizontal group carousel. The section title lives on the Home screen. */
export function GroupHighlights({
  groups,
  onSeeAllPress,
  onGroupPress,
}: GroupHighlightsProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
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
          <Text
            size="sm"
            align="center"
            color={colors.textMuted}
            numberOfLines={1}
          >
            {group.name}
          </Text>
        </Pressable>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Browse groups"
        onPress={onSeeAllPress}
        style={styles.groupItem}
      >
        <View style={styles.addIcon}>
          <Icon name="add" size={24} color={colors.primaryText} />
        </View>
        <Text size="sm" align="center" color={colors.primaryText}>
          Find groups
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const useStyles = makeStyles((t) => ({
  groupList: {
    gap: t.spacing.lg,
    paddingVertical: t.spacing.xs,
  },
  groupItem: {
    width: 74,
    alignItems: "center",
    gap: t.spacing.sm,
  },
  addIcon: {
    width: 58,
    height: 58,
    borderRadius: t.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.primarySoft,
    borderWidth: 1,
    borderColor: t.colors.primaryBorder,
    borderStyle: "dashed",
  },
}));
