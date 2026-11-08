import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../src/state/useAuthStore";
import { StyledButton } from "../src/components/StyledButton";
import {
  Text,
  Stack,
  InputField,
  Card,
  Screen,
} from "../src/components/primitives";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    setError("");
    try {
      await login(email, password);
      router.replace("/");
    } catch {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <Screen padding="lg">
      <View style={styles.container}>
        <Card>
          <Stack gap="lg" padding="md">
            <Stack gap="sm" align="center">
              <Text size="xl" weight="bold" align="center">
                Welcome back
              </Text>
              <Text size="sm" align="center">
                Beheer je groepen en verdeel eenvoudig alle kosten.
              </Text>
            </Stack>

            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              testID="email-input"
            />

            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              testID="password-input"
              error={error !== "" ? error : undefined}
            />

            <StyledButton
              label="Log in"
              onPress={handleLogin}
              isLoading={isLoading}
              testID="login-button"
            />
          </Stack>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
