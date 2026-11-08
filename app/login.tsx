import { useState } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../src/state/useAuthStore";
import { StyledButton } from "../src/components/StyledButton";
import { Text, Stack, InputField } from "../src/components/primitives";

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.cardWrapper}>
        <Stack gap="lg" padding="lg">
          <Stack gap="sm" align="center">
            <Text size="xl" weight="bold" align="center">
              Welcome back
            </Text>
            <Text size="sm" align="center" color="#6B7280">
              Beheer je groepen en verdeel eenvoudig alle groeps- en individuele
              kosten.
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
