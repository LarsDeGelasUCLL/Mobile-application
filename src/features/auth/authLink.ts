/**
 * Handles an auth email link URL: "unrelated" when it carries no code (an
 * ordinary deep link), "completed" after signing in with its PKCE code, and
 * "failed" for a broken URL, an error param or a rejected code.
 */
export async function exchangeAuthLinkCode(
  url: string,
  exchangeCode: (code: string) => Promise<{ error: unknown | null }>,
): Promise<"unrelated" | "completed" | "failed"> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return "failed";
  }

  if (
    parsedUrl.searchParams.has("error") ||
    parsedUrl.searchParams.has("error_code")
  ) {
    return "failed";
  }

  const code = parsedUrl.searchParams.get("code");
  if (!code) {
    return "unrelated";
  }

  try {
    const { error } = await exchangeCode(code);
    return error ? "failed" : "completed";
  } catch {
    return "failed";
  }
}
