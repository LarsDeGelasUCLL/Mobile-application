import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Icon, Row, Stack, Text } from "../../../components/primitives";
import type { FeedFilter } from "../../../types";
import { colors } from "../../../theme/colors";

interface FeedFilterOption {
  value: FeedFilter;
  label: string;
  description: string;
  icon: "sparkles-outline" | "time-outline" | "people-outline";
}

const filterOptions: FeedFilterOption[] = [
  {
    value: "for-you",
    label: "For you",
    description: "A mix of updates from your groups",
    icon: "sparkles-outline",
  },
  {
    value: "recent",
    label: "Recent",
    description: "Show the latest posts first",
    icon: "time-outline",
  },
  {
    value: "by-group",
    label: "By group",
    description: "Browse updates from one group",
    icon: "people-outline",
  },
];

interface FeedFilterMenuProps {
  value: FeedFilter;
  onChange: (value: FeedFilter) => void;
}

export function FeedFilterMenu({ value, onChange }: FeedFilterMenuProps) {
  const [visible, setVisible] = useState(false);
  const selectedFilter =
    filterOptions.find((option) => option.value === value) ?? filterOptions[0];

  const selectFilter = (filter: FeedFilter) => {
    onChange(filter);
    setVisible(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Feed filter: ${selectedFilter.label}`}
        accessibilityState={{ expanded: visible }}
        onPress={() => setVisible(true)}
        style={styles.trigger}
        testID="feed-filter-button"
      >
        <Icon name="options-outline" size={19} color={colors.primary} />
        <Text size="sm" weight="medium" color={colors.primary}>
          {selectedFilter.label}
        </Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close feed filter"
            onPress={() => setVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.popup} testID="feed-filter-popup">
            <Row justify="space-between" align="center">
              <Stack gap="none">
                <Text size="lg" weight="bold">
                  Filter your feed
                </Text>
                <Text size="sm" color={colors.muted}>
                  More ways to browse are coming soon.
                </Text>
              </Stack>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close feed filter"
                onPress={() => setVisible(false)}
                hitSlop={8}
              >
                <Icon name="close" size={22} color={colors.muted} />
              </Pressable>
            </Row>

            <Stack gap="sm">
              {filterOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => selectFilter(option.value)}
                    style={[
                      styles.option,
                      isSelected && styles.selectedOption,
                    ]}
                    testID={`feed-filter-${option.value}`}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        isSelected && styles.selectedOptionIcon,
                      ]}
                    >
                      <Icon
                        name={option.icon}
                        size={20}
                        color={isSelected ? colors.primary : colors.muted}
                      />
                    </View>
                    <View style={styles.optionText}>
                      <Text size="sm" weight="bold">
                        {option.label}
                      </Text>
                      <Text size="sm" color={colors.muted}>
                        {option.description}
                      </Text>
                    </View>
                    {isSelected ? (
                      <Icon name="checkmark" size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </Stack>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 140,
    paddingHorizontal: 16,
    backgroundColor: "rgba(40, 35, 51, 0.28)",
  },
  popup: {
    width: "100%",
    maxWidth: 380,
    gap: 18,
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  selectedOption: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySoft,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  selectedOptionIcon: {
    backgroundColor: colors.surface,
  },
  optionText: {
    flex: 1,
  },
});
