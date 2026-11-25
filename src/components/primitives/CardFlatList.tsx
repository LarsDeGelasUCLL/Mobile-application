import { FlatList, type FlatListProps } from "react-native";
import { Divider } from "./Divider";
import { makeStyles } from "../../theme/ThemeProvider";

/** `FlatList` with the `CardList` look: card border while it has items, `Divider` between rows. */
export function CardFlatList<T>({ style, ...props }: FlatListProps<T>) {
  const styles = useStyles();
  const hasItems = (props.data?.length ?? 0) > 0;
  return (
    <FlatList
      ItemSeparatorComponent={Divider}
      {...props}
      style={[hasItems && styles.list, style]}
    />
  );
}

const useStyles = makeStyles((t) => ({
  // flexGrow 0 so a short list does not stretch the border.
  list: {
    flexGrow: 0,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
}));
