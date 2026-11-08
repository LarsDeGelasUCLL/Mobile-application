import { View, Pressable, StyleSheet } from "react-native";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export function Card({ children, onPress }: CardProps) {
  if (onPress !== undefined) {
    return (
      <Pressable onPress={onPress} style={styles.base}>
        {children}
      </Pressable>
    );
  }

  return <View style={styles.base}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: "100%",
  },
});
