import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Icon } from "./Icon";
import { Sheet } from "./Sheet";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

export interface SelectOption<T extends string> {
  label: string;
  value: T;
}

interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  testID?: string;
}

/** Dropdown field: shows the current value, opens a sheet of options. */
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  testID,
}: SelectProps<T>) {
  const styles = useStyles();
  const { iconSize } = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);

  return (
    <View style={styles.container}>
      <Text size="sm" weight="medium">
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${current?.label ?? "not set"}`}
        accessibilityHint="Opens a list of options"
        style={({ pressed }) => [styles.field, pressed && styles.pressed]}
        testID={testID}
      >
        <View style={styles.fieldValue}>
          <Text numberOfLines={1}>{current?.label ?? "Choose…"}</Text>
        </View>
        <Icon name="chevron-down" size={iconSize.md} tone="muted" />
      </Pressable>

      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title={label}
        testID={testID !== undefined ? `${testID}-sheet` : undefined}
      >
        <ScrollView>
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.pressed,
                ]}
                testID={
                  testID !== undefined
                    ? `${testID}-option-${option.value}`
                    : undefined
                }
              >
                <View style={styles.fieldValue}>
                  <Text
                    weight={selected ? "medium" : "normal"}
                    tone={selected ? "primary" : "default"}
                  >
                    {option.label}
                  </Text>
                </View>
                {selected && (
                  <Icon
                    name="checkmark"
                    size={iconSize.md}
                    tone="primary"
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </Sheet>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: { width: "100%", gap: 6 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.sm,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: t.spacing.sm,
    borderWidth: 1,
    borderColor: t.colors.borderStrong,
    borderRadius: t.radius.sm,
    backgroundColor: t.colors.surface,
  },
  fieldValue: { flex: 1 },
  pressed: { backgroundColor: t.colors.surfaceTint },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.sm,
    minHeight: 48,
    paddingHorizontal: t.spacing.sm,
    borderRadius: t.radius.sm,
  },
}));
