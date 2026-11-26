import { useEffect } from "react";
import { Platform } from "react-native";
import { useI18n } from "../../i18n";

/** Web only: `<html lang>` follows the app language (screen readers, hyphenation). */
export function useDocumentLanguage() {
  const { language } = useI18n();
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.documentElement.lang = language;
  }, [language]);
}
