// The single Supabase client for the app. The polyfill gives React Native the
// `URL` API that supabase-js needs.
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import type { Database } from "../types/database.types";

// Set in .env; Expo inlines EXPO_PUBLIC_* variables at build time.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Where the session is kept: localStorage on web (none during the static
    // render on Node, where `window` is missing), AsyncStorage on native.
    storage:
      Platform.OS === "web"
        ? typeof window !== "undefined"
          ? window.localStorage
          : undefined
        : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Only web gets auth links as URLs; native handles them in useAuthDeepLinks.
    detectSessionInUrl: Platform.OS === "web",
  },
});

// Native: refresh the token only while the app is in the foreground.
// (Web refreshes on its own.)
if (Platform.OS !== "web") {
  if (AppState.currentState === "active") {
    supabase.auth.startAutoRefresh();
  }

  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
