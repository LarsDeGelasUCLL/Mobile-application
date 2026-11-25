import { router, type Href } from "expo-router";

/** Back when there is history (stack page), else replace with `fallback`. */
export function goBackOr(fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
