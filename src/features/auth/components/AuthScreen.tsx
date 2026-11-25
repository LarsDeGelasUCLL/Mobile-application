import type { ReactNode } from "react";
import { View } from "react-native";
import { Card, Screen } from "../../../components/primitives";
import { makeStyles } from "../../../theme/ThemeProvider";
import { BrandHeader } from "./BrandHeader";

interface AuthScreenProps {
  /** The card's content. */
  children: ReactNode;
  /** Shown under the card, e.g. the "New to Laruna?" link. */
  belowCard?: ReactNode;
  /** On the screen. */
  testID?: string;
  /** On the centred column inside the screen. */
  contentTestID?: string;
}

/** The logged-out layout: brand header and one card, centred on the screen. */
export function AuthScreen({
  children,
  belowCard,
  testID,
  contentTestID,
}: AuthScreenProps) {
  const styles = useStyles();
  return (
    <Screen padding="lg" testID={testID}>
      <View style={styles.container} testID={contentTestID}>
        <BrandHeader testID="login-brand-header" />
        <Card>{children}</Card>
        {belowCard}
      </View>
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  container: {
    flex: 1,
    justifyContent: "center",
  },
}));
